import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export type Time = bigint;
export type SongId = bigint;
export interface Song {
    id: SongId;
    title: string;
    lyrics: Array<Section>;
    createdAt: Time;
    composer: string;
    updatedAt: Time;
    musicSheet?: ExternalBlob;
    category: Type;
}
export interface SongInput {
    title: string;
    lyrics: Array<Section>;
    composer: string;
    musicSheet?: ExternalBlob;
    category: Type;
}
export interface Section {
    title: string;
    lyrics: Array<string>;
}
export enum Type {
    lent = "lent",
    easter = "easter",
    mass_songs = "mass_songs",
    advent = "advent",
    marian_hymns = "marian_hymns",
    general_devotion = "general_devotion"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addSong(songInput: SongInput): Promise<SongId>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteSong(id: SongId): Promise<void>;
    getAllSongs(): Promise<Array<Song>>;
    getCallerUserRole(): Promise<UserRole>;
    getSong(id: SongId): Promise<Song>;
    getSongsByCategory(category: Type): Promise<Array<Song>>;
    isCallerAdmin(): Promise<boolean>;
    searchSongsByTitle(searchTerm: string): Promise<Array<Song>>;
    updateSong(id: SongId, songInput: SongInput): Promise<void>;
}
