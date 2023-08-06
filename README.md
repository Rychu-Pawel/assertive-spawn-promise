# assertive-spawn-promise

Deno module that spawns a child process using Deno.Command().spawn() wrapped in a promise that resolves only on 0 exit code and rejects in all other cases. It doesn't store/cache any stdio.

Spawn arguments are the same as Deno.Command constructor parameters. It returns a promise enriched with a child property

## Usage

script.ts:
```ts
import spawn, { AssertiveSpawnPromiseError } from "https://deno.land/x/assertive-spawn-promise/mod.ts";

try {
    const promise = spawn(`deno`, { args: [`-V`] });

    console.log(`Child PID:`, promise.child.pid);

    await promise;
} catch (error) {
    const spawnError = error as AssertiveSpawnPromiseError;

    console.log(`message`, spawnError.message);
    console.log(`exitCode`, spawnError.exitCode);
    console.log(`signal`, spawnError.signal);
    console.log(`errorCode`, spawnError.errorCode);
}
```
terminal:
```
$ deno run --allow-run script.ts 
Child PID:  19228
deno 1.35.3
```

## Reading stdout example

script.ts
```ts
import spawn, { AssertiveSpawnPromiseError } from "https://deno.land/x/assertive-spawn-promise/mod.ts";

try {
    let denoVersion = ``;

    const promise = spawn(`deno`, { args: [`-V`], stdout: `piped` });

    const decoder = new TextDecoder();

    for await (const chunk of promise.child.stdout)
        denoVersion += decoder.decode(chunk, { stream: true });

    await promise;

    console.log(`Deno version is`, denoVersion.trim());
} catch (error) {
    const spawnError = error as AssertiveSpawnPromiseError;

    console.log(`message`, spawnError.message);
    console.log(`exitCode`, spawnError.exitCode);
    console.log(`signal`, spawnError.signal);
    console.log(`errorCode`, spawnError.errorCode);
}
```

terminal:
```
$ deno run --allow-run script.ts
Deno version is deno 1.35.3
```