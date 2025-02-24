export class Logger {
  public static warn(log: string, path?: string) {
    console.warn(
      `[${new Date().toUTCString()}] [WARN] [${path ?? 'NO PATH'}] => ${log}`,
    );
  }

  public static info(log: string, path?: string) {
    console.log(
      `[${new Date().toUTCString()}] [INFO] [${path ?? 'NO PATH'}] => ${log}`,
    );
  }

  public static debug(log: string, path?: string) {
    console.debug(
      `[${new Date().toUTCString()}] [DEBUG] [${path ?? 'NO PATH'}] => ${log}`,
    );
  }

  public static error(log: string, path?: string, errorLog?: string) {
    console.error(
      `[${new Date().toUTCString()}] [ERROR] [${path ?? 'NO PATH'}] => ${log}${errorLog && `:: ERROR => ${errorLog}`}`,
    );
  }
}
