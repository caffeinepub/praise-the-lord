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
export interface MembershipApplication {
    id: MembershipId;
    status: MembershipStatus;
    name: string;
    submittedAt: Time;
    email: string;
    message: string;
    phone: string;
    parish: string;
}
export type Time = bigint;
export type SongId = bigint;
export type MembershipId = bigint;
export interface MembershipApplicationInput {
    name: string;
    email: string;
    message: string;
    phone: string;
    parish: string;
}
export type NewsPostId = bigint;
export interface DevotionalPrayer {
    id: bigint;
    title: string;
    content: Array<Section>;
}
export interface NewsPost {
    id: NewsPostId;
    title: string;
    body: string;
    createdAt: Time;
    updatedAt: Time;
}
export interface DownloadItemInput {
    title: string;
    fileBlob: ExternalBlob;
    description: string;
}
export interface NewsPostInput {
    title: string;
    body: string;
}
export interface DownloadItem {
    id: DownloadItemId;
    title: string;
    createdAt: Time;
    fileBlob: ExternalBlob;
    description: string;
}
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
export type DownloadItemId = bigint;
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
export interface UserProfile {
    name: string;
}
export enum MembershipStatus {
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
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
    addDownloadItem(downloadItemInput: DownloadItemInput): Promise<DownloadItemId>;
    addNewsPost(newsPostInput: NewsPostInput): Promise<NewsPostId>;
    addSong(songInput: SongInput): Promise<SongId>;
    approveMembershipApplication(id: MembershipId): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteDownloadItem(id: DownloadItemId): Promise<void>;
    deleteMembershipApplication(id: MembershipId): Promise<void>;
    deleteNewsPost(id: NewsPostId): Promise<void>;
    deleteSong(id: SongId): Promise<void>;
    getAllDevotionalPrayers(): Promise<Array<DevotionalPrayer>>;
    getAllDownloadItems(): Promise<Array<DownloadItem>>;
    getAllMembershipApplications(): Promise<Array<MembershipApplication>>;
    getAllNewsPosts(): Promise<Array<NewsPost>>;
    getAllSongs(): Promise<Array<Song>>;
    getByCategory(): Promise<{
        lent: Array<Song>;
        easter: Array<Song>;
        mass_songs: Array<Song>;
        advent: Array<Song>;
        marian_hymns: Array<Song>;
        general_devotion: Array<Song>;
    }>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDevotionalPrayer(id: bigint): Promise<DevotionalPrayer>;
    getDownloadItem(id: DownloadItemId): Promise<DownloadItem>;
    getNewsPost(id: NewsPostId): Promise<NewsPost>;
    getSong(id: SongId): Promise<Song>;
    getSongsByCategory(category: Type): Promise<Array<Song>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    rejectMembershipApplication(id: MembershipId): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchDevotionalPrayers(searchTerm: string): Promise<Array<DevotionalPrayer>>;
    searchMembershipApplications(searchTerm: string): Promise<Array<MembershipApplication>>;
    searchSongsByTitle(searchTerm: string): Promise<Array<Song>>;
    submitMembershipApplication(applicationInput: MembershipApplicationInput): Promise<MembershipId>;
    updateNewsPost(id: NewsPostId, newsPostInput: NewsPostInput): Promise<void>;
    updateSong(id: SongId, songInput: SongInput): Promise<void>;
}
