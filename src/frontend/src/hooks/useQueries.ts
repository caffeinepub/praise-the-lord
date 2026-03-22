import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Song, SongId, SongInput, Type } from "../backend";
import { useActor } from "./useActor";

export function useAllSongs() {
  const { actor, isFetching } = useActor();
  return useQuery<Song[]>({
    queryKey: ["songs"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllSongs();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSong(id: SongId) {
  const { actor, isFetching } = useActor();
  return useQuery<Song>({
    queryKey: ["song", id.toString()],
    queryFn: async () => {
      if (!actor) throw new Error("No actor");
      return actor.getSong(id);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSearchSongs(term: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Song[]>({
    queryKey: ["songs", "search", term],
    queryFn: async () => {
      if (!actor) return [];
      return actor.searchSongsByTitle(term);
    },
    enabled: !!actor && !isFetching && term.length > 0,
  });
}

export function useSongsByCategory(category: Type | "all") {
  const { actor, isFetching } = useActor();
  return useQuery<Song[]>({
    queryKey: ["songs", "category", category],
    queryFn: async () => {
      if (!actor) return [];
      if (category === "all") return actor.getAllSongs();
      return actor.getSongsByCategory(category);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddSong() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: SongInput) => {
      if (!actor) throw new Error("No actor");
      return actor.addSong(input);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["songs"] });
    },
  });
}

export function useUpdateSong() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }: { id: SongId; input: SongInput }) => {
      if (!actor) throw new Error("No actor");
      return actor.updateSong(id, input);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["songs"] });
    },
  });
}

export function useDeleteSong() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: SongId) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteSong(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["songs"] });
    },
  });
}
