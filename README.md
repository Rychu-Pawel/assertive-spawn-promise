# assertive-spawn-promise
Deno module that spawns a child process using Deno.Command().spawn() wrapped in a promise that resolves only on 0 exit code and rejects in all other cases.
