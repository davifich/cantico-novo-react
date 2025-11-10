/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string = string> extends Record<string, unknown> {
      StaticRoutes: `/` | `/(tabs)` | `/(tabs)/` | `/(tabs)/explore` | `/_sitemap` | `/all-songs` | `/categories` | `/create-song` | `/explore` | `/import` | `/modal` | `/player` | `/quick-access` | `/settings`;
      DynamicRoutes: `/category/${Router.SingleRoutePart<T>}` | `/song/${Router.SingleRoutePart<T>}`;
      DynamicRouteTemplate: `/category/[id]` | `/song/[id]`;
    }
  }
}
