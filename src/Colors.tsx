import AsyncStorage from '@react-native-community/async-storage';

let LightColors: any = {
    primary: '#3880ff',
    secondary: '#8fb7ff',
    danger: '#f04141',
    success: '#42b883',
    statusBar: '#fff',
    header: '#ffffff',
    dark: '#333333',

    fontPrimary: '#000',
    fontSecondary: '#777',
    fontTertiary: '#666',

    barStyle: 'dark-content',
    searchBar: '#eee',

    popup: '#fff',

    background: '#fff',
    highlight: '#ddd',
    strongHighlight: '#aaa'
}

const DarkColors: any = {
    primary: '#3880ff',
    secondary: '#8fb7ff',
    danger: '#f04141',
    success: '#42b883',
    statusBar: '#fff',
    header: '#000',
    dark: '#eee',

    fontPrimary: '#fff',
    fontSecondary: '#777',
    fontTertiary: '#555',

    barStyle: 'light-content',
    searchBar: '#222',

    popup: '#222',

    background: '#000',
    highlight: '#222',
    strongHighlight: '#444'
}

let COLORS: any = {};
let mode: 'dark' | 'light' = 'light';
applyColors(LightColors);

function applyColors(colors: any) {
    for (var prop in colors) {
        if (Object.prototype.hasOwnProperty.call(colors, prop)) {
            COLORS[prop] = colors[prop];
        }
    }
}

async function saveModeTo(value: 'dark' | 'light') {
    await AsyncStorage.setItem('colorMode', value);
    mode = value;
}

async function applySavedMode() {
    let result = await AsyncStorage.getItem('colorMode');
    mode = (result == 'dark') ? 'dark' : 'light';
    useMode(mode);
}

async function useMode(value: 'dark' | 'light') {
    let colors = (value == 'dark') ? DarkColors : LightColors; 
    applyColors(colors);
    await saveModeTo(value);
}

async function toggleMode() {
    if (mode == 'dark')
        await useMode('light');
    else
        await useMode('dark');
}

function getMode(): 'dark' | 'light' {
    return mode;
}

export default COLORS;
export { toggleMode, getMode, applySavedMode }