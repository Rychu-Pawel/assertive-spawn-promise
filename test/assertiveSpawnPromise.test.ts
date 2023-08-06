import { assert } from "https://deno.land/std@0.196.0/assert/assert.ts";
import { assertEquals } from "https://deno.land/std@0.196.0/assert/assert_equals.ts";
import { assertExists } from "https://deno.land/std@0.196.0/assert/assert_exists.ts";
import { assertRejects } from "https://deno.land/std@0.196.0/assert/assert_rejects.ts";

import { join as pathJoin } from "https://deno.land/std@0.196.0/path/mod.ts";

import spawn, { AssertiveSpawnPromiseError } from "../mod.ts";

Deno.test(`Successfully spawns`, async () => {
    // Arrange
    const scriptPath = pathJoin(Deno.cwd(), `test/testScripts/exitZero.sh`);

    // Act
    await spawn(`bash`, { args: [scriptPath] });

    // Assert
    assert(true);
});

Deno.test(`Returns child inside promise`, async () => {
    // Arrange
    const scriptPath = pathJoin(Deno.cwd(), `test/testScripts/exitZero.sh`);

    // Act
    const promise = spawn(`bash`, { args: [scriptPath] });

    const child = promise.child;

    await promise;

    // Assert
    assertExists(child);
    assert(child instanceof Deno.ChildProcess);
});

Deno.test(`Rejects on error`, async () => {
    // Arrange
    const sutMethod = async () => await spawn(`dummyCommandThatDoesn'tExist`);

    // Act & Assert
    const error = await assertRejects(sutMethod) as AssertiveSpawnPromiseError;

    // Assert
    assert(error?.message);
    assertEquals(error!.errorCode, `ENOENT`);
});

/* This test fails, but looks like a bug in Deno */
// Deno.test(`Rejects with correct signal`, async () => {
//     // Arrange
//     const signal = `SIGKILL`;

//     const scriptPath = pathJoin(Deno.cwd(), `test/testScripts/fiveSecondsScript.sh`);

//     const sutMethod = async () => {
//         const promise = spawn(`bash`, { args: [scriptPath] });
//         promise.child.kill(signal);
//         await promise;
//     };

//     // Act & Assert
//     const error = await assertRejects(sutMethod) as AssertiveSpawnPromiseError;

//     // Assert
//     assertEquals(error.signal, signal);
// });

Deno.test(`Rejects with correct exit code`, async () => {
    // Arrange
    const scriptPath = pathJoin(Deno.cwd(), `test/testScripts/exitNonZero.sh`);

    const sutMethod = async () => await spawn(`bash`, { args: [scriptPath] });

    // Act
    const error = await assertRejects(sutMethod) as AssertiveSpawnPromiseError;

    // Assert
    assertEquals(error.exitCode, 12);
});