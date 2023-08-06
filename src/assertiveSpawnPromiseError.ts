export type AssertiveSpawnPromiseError = Error & {
    exitCode?: number;
    signal?: Deno.Signal;
    errorCode?: string;
};
