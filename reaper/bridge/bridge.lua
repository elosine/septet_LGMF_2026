-- bridge.lua — the AI's door into Reaper (PLAN 0k.1; docs/REAPER_CONTROL.md; RUNNING_LOG §48).
--
-- A defer loop inside Reaper (~30 ticks/s). Every tick it looks in the RUNTIME inbox — Reaper's own
-- resource folder, %APPDATA%\REAPER\bridge\inbox, machine-level, shared by every project — for the
-- oldest *.lua file, runs it under pcall, writes  bridge\outbox\<name>.json  with either { ok = true,
-- result = <what the job returned> } or { ok = false, error = <message> }, and moves the job to
-- bridge\done. Once a second it writes  bridge\heartbeat.json  so the other side knows Reaper is alive
-- and which project is open. A job returning { __reload = true } makes the bridge restart from this file.
--
-- A JOB is a Lua chunk with `reaper` in scope that RETURNS its result (a table, string, number,
-- boolean or nil). It must not loop for long: one job = one tick; nothing async.
--
-- Started by  %APPDATA%\REAPER\Scripts\__startup.lua  (a dofile line, installed by the repo) at every
-- Reaper launch, or once by hand: Actions → Show action list → ReaScript: Load… → this file.
-- Never two copies: a running bridge sets an extstate flag and a second start exits.

local sep = package.config:sub(1, 1)
local src = debug.getinfo(1, 'S').source
local ROOT = src:match('^@(.*)[/\\][^/\\]+$') or '.'
-- the RUNTIME lives outside any repo, in Reaper's own resource folder (%APPDATA%\REAPERridge):
-- one bridge per machine, any project's tools talk to it (docs/REAPER_CONTROL.md; README.md here)
local RUNTIME = reaper.GetResourcePath() .. sep .. 'bridge'
local INBOX, OUTBOX, DONE = RUNTIME .. sep .. 'inbox', RUNTIME .. sep .. 'outbox', RUNTIME .. sep .. 'done'
local HEART = RUNTIME .. sep .. 'heartbeat.json'
local VERSION = '0.2.1 (2026-09-04) runtime in the Reaper resource folder; reload fixed'

-- one bridge only
local stamp = tostring(os.time()) .. '-' .. tostring(math.random(1e9))
if reaper.GetExtState('septet_bridge', 'running') ~= '' then
  local age = os.time() - (tonumber(reaper.GetExtState('septet_bridge', 'last_tick')) or 0)
  if age < 5 then reaper.ShowConsoleMsg('[bridge] already running — this copy exits\n') return end
end
reaper.SetExtState('septet_bridge', 'running', stamp, false)

for _, d in ipairs({ INBOX, OUTBOX, DONE }) do reaper.RecursiveCreateDirectory(d, 0) end

-- ---------------------------------------------------------------- a small JSON encoder
local function is_array(t)
  local n = 0
  for k in pairs(t) do if type(k) ~= 'number' or k <= 0 or k % 1 ~= 0 then return false end n = n + 1 end
  return n == #t
end
local esc = { ['"'] = '\\"', ['\\'] = '\\\\', ['\n'] = '\\n', ['\r'] = '\\r', ['\t'] = '\\t' }
local function json(v, depth)
  depth = depth or 0
  if depth > 24 then return '"<deep>"' end
  local t = type(v)
  if t == 'nil' then return 'null'
  elseif t == 'boolean' then return v and 'true' or 'false'
  elseif t == 'number' then
    if v ~= v or v == math.huge or v == -math.huge then return 'null' end
    if v % 1 == 0 and math.abs(v) < 1e15 then return string.format('%d', v) end
    return string.format('%.6g', v)
  elseif t == 'string' then return '"' .. v:gsub('[%c"\\]', function(c) return esc[c] or string.format('\\u%04x', c:byte()) end) .. '"'
  elseif t == 'table' then
    local parts = {}
    if is_array(v) then
      for i = 1, #v do parts[#parts + 1] = json(v[i], depth + 1) end
      return '[' .. table.concat(parts, ',') .. ']'
    end
    local keys = {}
    for k in pairs(v) do keys[#keys + 1] = tostring(k) end
    table.sort(keys)
    for _, k in ipairs(keys) do
      local val = v[k]; if val == nil then val = v[tonumber(k)] end
      parts[#parts + 1] = json(k, depth + 1) .. ':' .. json(val, depth + 1)
    end
    return '{' .. table.concat(parts, ',') .. '}'
  end
  return '"<' .. t .. '>"'
end

local function write_file(path, text)
  local f = io.open(path, 'wb'); if not f then return false end
  f:write(text); f:close(); return true
end
local function read_file(path)
  local f = io.open(path, 'rb'); if not f then return nil end
  local s = f:read('a'); f:close(); return s
end

-- ---------------------------------------------------------------- jobs
local function next_job()
  reaper.EnumerateFiles(INBOX, -1)        -- drop Reaper's directory cache
  local names, i = {}, 0
  while true do
    local n = reaper.EnumerateFiles(INBOX, i); if not n then break end
    if n:match('%.lua$') then names[#names + 1] = n end
    i = i + 1
  end
  table.sort(names)
  return names[1]
end

local function run_job(name)
  local path = INBOX .. sep .. name
  local code = read_file(path)
  local out = { name = name, bridge = VERSION, project = select(2, reaper.EnumProjects(-1, '')), t0 = os.date('!%Y-%m-%dT%H:%M:%SZ') }
  local t = reaper.time_precise()
  if not code then out.ok = false; out.error = 'cannot read job'
  else
    local env = setmetatable({ job = { name = name, path = path, root = RUNTIME, code = ROOT } }, { __index = _G })
    local chunk, err = load(code, '=' .. name, 't', env)
    if not chunk then out.ok = false; out.error = 'load: ' .. tostring(err)
    else
      local ok, res = xpcall(chunk, function(e) return tostring(e) .. '\n' .. debug.traceback('', 2) end)
      out.ok = ok
      if ok then out.result = res else out.error = res end
      if ok and type(res) == 'table' and res.__reload then RELOAD = true; out.result = { reloading = src } end
    end
  end
  out.ms = math.floor((reaper.time_precise() - t) * 1000 + 0.5)
  write_file(OUTBOX .. sep .. name:gsub('%.lua$', '') .. '.json', json(out))
  os.remove(DONE .. sep .. name)
  if not os.rename(path, DONE .. sep .. name) then os.remove(path) end
  if not out.ok then reaper.ShowConsoleMsg('[bridge] ' .. name .. ' FAILED: ' .. tostring(out.error) .. '\n') end
end

local last_beat = 0
local function heartbeat()
  local now = os.time()
  if now == last_beat then return end
  last_beat = now
  reaper.SetExtState('septet_bridge', 'last_tick', tostring(now), false)
  local _, proj = reaper.EnumProjects(-1, '')
  write_file(HEART, json({ time = now, iso = os.date('!%Y-%m-%dT%H:%M:%SZ'), bridge = VERSION, stamp = stamp,
    reaper = reaper.GetAppVersion(), project = proj, tracks = reaper.CountTracks(0), playing = reaper.GetPlayState() }))
end

local function tick()
  local ok, err = pcall(function()
    heartbeat()
    local name = next_job()
    if name then run_job(name) end
  end)
  if not ok then reaper.ShowConsoleMsg('[bridge] tick error: ' .. tostring(err) .. '\n') end
  if RELOAD then   -- a job returned { __reload = true }: stop this loop, start the file afresh (new code, same script instance)
    reaper.DeleteExtState('septet_bridge', 'running', false)
    reaper.ShowConsoleMsg('[bridge] reloading ' .. src:match('^@(.*)$') .. '\n')
    RELOAD = false          -- or the fresh copy would see the flag and reload forever (RUNNING_LOG §63)
    dofile(src:match('^@(.*)$'))
    return
  end
  reaper.defer(tick)
end

reaper.atexit(function() reaper.DeleteExtState('septet_bridge', 'running', false); os.remove(HEART) end)
reaper.ShowConsoleMsg('[bridge] ' .. VERSION .. ' watching ' .. INBOX .. '\n')
tick()
