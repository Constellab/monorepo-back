import { Injectable, Logger } from '@nestjs/common';
import { ChildProcess, exec, execFile, ExecOptions, spawn } from 'child_process';
import { Observable } from 'rxjs';

export interface CnSpawnResult {
  status: 'success' | 'error';
  data: string;
}

export interface CnSpawnResponse {
  childProcess: ChildProcess;
  observable: Observable<CnSpawnResult>;
}

export enum CnExecCommandMode {
  STDERR_AS_ERROR, // reject promis when stderr is not empty
  STDERR_AS_WARNING, // on stderr, log warning and return stdout
  STDERR_AS_SUCCESS, // consider STDERR as success and return stdout and stderr
}

export interface CnExecOptions extends ExecOptions {
  /**
   * Mode to handle stderr
   * default is CnExecCommandMode.STDERR_AS_WARNING
   */
  errorMode?: CnExecCommandMode;

  /**
   * if true error are ignored and error is returned in the result
   * default false
   */
  ignoreError?: boolean;
}

const cnExecCommandDefaultOptions: CnExecOptions = {
  errorMode: CnExecCommandMode.STDERR_AS_WARNING,
  ignoreError: false,
};

/**
 * Service to execute shell commands and scripts
 */
@Injectable()
export class CnCommandService {
  private readonly logger = new Logger(CnCommandService.name);

  /**
   * Execute a command and return the result once the command is finished
   * @param command command to execute
   * @param options options to pass to the command
   */
  public execCommand(command: string, options: CnExecOptions = cnExecCommandDefaultOptions): Promise<string> {
    return new Promise((resolve, reject) => {
      // stdout/stderr are strings here since no 'buffer' encoding is set in options.
      exec(command, options, (error, stdout: string, stderr: string) => {
        if (error) {
          if (options.ignoreError) {
            return resolve(error.toString());
          } else {
            this.logger.error(
              `Error during the execution of the command '${command}'. Error : '${String(error)}'`
            );
            return reject(error instanceof Error ? error : new Error(String(error)));
          }
        }

        switch (options.errorMode) {
          case CnExecCommandMode.STDERR_AS_SUCCESS:
            return resolve(stdout + stderr);
          case CnExecCommandMode.STDERR_AS_WARNING:
            if (stderr) {
              this.logger.warn(
                `Warning during the execution of the command '${command}'. Error : '${stderr}'`
              );
            }
            return resolve(stdout);
          case CnExecCommandMode.STDERR_AS_ERROR:
            if (stderr) {
              this.logger.error(
                `Error during the execution of the command '${command}'. Error : '${stderr}'`
              );
              return reject(new Error(stderr));
            }
            return resolve(stdout);
        }
      });
    });
  }

  public spawn(command: string, args: string[] = []): CnSpawnResponse {
    const spawnCommand = spawn(command, args);
    const obs: Observable<CnSpawnResult> = new Observable((subscriber) => {
      let lastError: string;

      spawnCommand.stdout.on('data', (data) => {
        subscriber.next({
          status: 'success',
          data: data.toString(),
        });
      });

      spawnCommand.stderr.on('data', (data) => {
        subscriber.next({
          status: 'error',
          data: data.toString(),
        });
        lastError = data.toString();
      });

      spawnCommand.on('exit', (code: number, signal: NodeJS.Signals | null) => {
        if (code === 0) {
          subscriber.complete();
        } else {
          subscriber.error({
            status: 'error',
            data: `Code : ${code} - Signal : ${signal} - Error : ${lastError}`,
          });
        }
      });
    });

    return {
      childProcess: spawnCommand,
      observable: obs,
    };
  }

  public execFile(file: string, options: string[] = []): Promise<string> {
    return new Promise((resolve, reject) => {
      execFile(file, options, (error, stdout, stderr) => {
        if (error) {
          this.logger.error(`Error during the execution of the file '${file}'. Error : '${error.message}'`);
          reject(error instanceof Error ? error : new Error(error.message));
          return;
        }
        if (stderr) {
          if (stdout) {
            this.logger.warn(`Warning during the execution of the file '${file}'. Error : '${stderr}'`);
          } else {
            this.logger.error(`Error during the execution of the file '${file}'. Error : '${stderr}'`);
            reject(new Error(stderr));
            return;
          }
        }
        return resolve(stdout);
      });
    });
  }
}
