/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string = string> extends Record<string, unknown> {
      StaticRoutes: `/` | `/_sitemap` | `/all-songs` | `/categories` | `/create-category` | `/create-song` | `/import` | `/player` | `/quick-access` | `/settings` | `/verify-import`;
      DynamicRoutes: `/category/${Router.SingleRoutePart<T>}` | `/song/${Router.SingleRoutePart<T>}`;
      DynamicRouteTemplate: `/category/[id]` | `/song/[id]`;
    }
  }
}
