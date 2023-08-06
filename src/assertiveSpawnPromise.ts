import { AssertiveSpawnPromiseError } from "./assertiveSpawnPromiseError.ts";

/**
 * Spawns a child process using Deno.Command().spawn() wrapped in a promise that resolves only on 0 exit code and rejects in all other cases.
 * @param {ConstructorParameters<typeof Deno.Command>} args same parameters as for the Deno.Command
 * @returns {Promise<void> & { child: Deno.ChildProcess }} promise enriched with a child object that resolves only 0 exit code
 */
const assertiveSpawnPromise = (...args: ConstructorParameters<typeof Deno.Command>): Promise<void> & { child: Deno.ChildProcess } => {
    const command = new Deno.Command(...args);

    let child: Deno.ChildProcess | undefined;

    try {
        child = command.spawn();
    }
    catch (error) {
        throw getErrorFromSpawnError(error, args[0]);
    }

    const promise = new Promise<void>((resolve, reject) => {
        child!.status
            .then(result => {
                if (result.success || result.code === 0)
                    resolve();

                if (result.signal !== null) {
                    const error = new Error(`Child process '${args[0]}' exited due to the ${result.signal} signal`);
                    const enrichedError = enrichError(error, result.code, result.signal);

                    reject(enrichedError);
                }

                if (result.code) {
                    const error = new Error(`Child process '${args[0]}' exited with code ${result.code}`);
                    const enrichedError = enrichError(error, result.code, result.signal ?? undefined);

                    reject(enrichedError);
                }

                resolve();
            })
            .catch(catchedError => {
                const error = getErrorFromResultError(catchedError, args[0]);
                reject(error);
            })
    });

    return Object.assign(promise, { child });
}

function getErrorFromSpawnError(catchedError: unknown, command: string | URL): AssertiveSpawnPromiseError {
    if (!catchedError)
        return new Error(`Spawning '${command}' failed for an unknown reason.`)

    if (typeof catchedError === `string`)
        return new Error(catchedError);

    if (catchedError instanceof Error) {
        const unknownError = catchedError as unknown as Record<string, unknown>;

        if (typeof unknownError.code === `string`) {
            unknownError.errorCode = unknownError.code;
            delete unknownError.code;
        }

        return unknownError as unknown as AssertiveSpawnPromiseError;
    }

    return new Error(catchedError.toString())
}

function enrichError(error: Error, exitCode: number, signal: Deno.Signal | undefined): AssertiveSpawnPromiseError {
    return Object.assign(error, { exitCode, signal });
}

function getErrorFromResultError(catchedError: unknown, command: string | URL): AssertiveSpawnPromiseError {
    if (!catchedError)
        return new Error(`Child process '${command}' exited for an unknown reason.`);

    if (catchedError instanceof Error)
        return catchedError;

    if (typeof catchedError === `string`)
        return new Error(catchedError);

    return new Error(catchedError.toString());
}

export default assertiveSpawnPromise;
