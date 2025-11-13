import 'expo-router/entry';
import { registerRootComponent } from 'expo';

// Polyfills globais necessários
import { Buffer } from '@craftzdog/react-native-buffer';
global.Buffer = Buffer;

// Polyfill para process
import process from 'process';
global.process = process;

// Polyfill para random values (importante para crypto)
import 'react-native-get-random-values';
