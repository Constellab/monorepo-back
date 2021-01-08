/**
 * Interface for the service that is decorated with @CleanableService
 *
 * The clean method will be called automatically when the ServiceCleaner.cleanServices
 * method is called
 */
export interface FlCleanableService {
  /**
   * Method to clean the service data (on logout for example)
   */
  clean(): void;
}


/**
 * Singleton that store the list of CleanableService services to clean when calling
 * cleanServices
 */
export class FlCleanerService {

  private static instance: FlCleanerService = null;

  private registeredServices: FlCleanableService[] = [];

  /**
   * @return the current instance of the translate service
   */
  public static getInstance(): FlCleanerService {
    if (!FlCleanerService.instance) {
      FlCleanerService.instance = new FlCleanerService();
    }

    return FlCleanerService.instance;
  }

  /**
   * Register a service to the list to call it's clean method when calling
   * cleanServices. The CleanableService register the services using this method
   * @param service service to register
   */
  public registerService(service: FlCleanableService): void {
    this.registeredServices.push(service);
  }

  /**
   * Call the clean method of all services annotated with CleanableService
   */
  public cleanServices(): void {
    for (const service of this.registeredServices) {
      if (!service.clean) {
        console.error('[ServiceCleaner] a registered service does not implement Cleanable');
        continue;
      }
      service.clean();
    }
  }
}
