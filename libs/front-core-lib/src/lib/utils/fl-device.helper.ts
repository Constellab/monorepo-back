export class FlDeviceHelper {

  public static isMac(): boolean {
    return navigator?.platform?.toUpperCase().indexOf('MAC') >= 0 ?? false;
  }
}
