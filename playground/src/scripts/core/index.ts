/** Minimal stand-in for the kit's core. Your real @/scripts/core replaces this. */
type Cleanup = void | (() => void);
interface Service {
  name: string;
  scope: "app" | "page";
  setup: () => Cleanup | Promise<Cleanup>;
}

const services: Service[] = [];
const listeners = new Map<string, Array<(detail?: unknown) => void | Promise<void>>>();

export function defineService(service: Service) {
  services.push(service);
}

export function on(event: string, fn: (detail?: unknown) => void | Promise<void>) {
  listeners.set(event, [...(listeners.get(event) ?? []), fn]);
}

/** Awaits every listener, like the kit's emit. */
export async function emit(event: string, detail?: unknown) {
  await Promise.all((listeners.get(event) ?? []).map((fn) => fn(detail)));
}

export async function boot() {
  for (const service of services) await service.setup();
  await emit("page:enter");
}
