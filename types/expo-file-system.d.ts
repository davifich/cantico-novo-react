  declare module "expo-file-system" {
    export interface FileInfo {
      exists: boolean;
      isDirectory: boolean;
      uri: string;
      size?: number;
      modificationTime?: number;
    }
  
    export interface DirectoryInfo {
      exists: boolean;
      isDirectory: boolean;
      uri: string;
    }
  
    export interface MakeDirectoryOptions {
      intermediates?: boolean;
    }
  
    export interface ReadOptions {
      encoding?: "utf8" | "base64";
    }
  
    export function getInfoAsync(uri: string): Promise<FileInfo>;
    export function deleteAsync(uri: string, opts?: { idempotent?: boolean }): Promise<void>;
    export function makeDirectoryAsync(uri: string, opts?: MakeDirectoryOptions): Promise<void>;
  
    export function writeAsStringAsync(
      uri: string,
      data: string,
      opts?: { encoding?: "utf8" | "base64" }
    ): Promise<void>;
  
    export function readAsStringAsync(
      uri: string,
      opts?: ReadOptions
    ): Promise<string>;
  
    export const documentDirectory: string;
    export const cacheDirectory: string;
  }
  