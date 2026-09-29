import { create } from "zustand";
import { toast } from "sonner";
import MiniSearch from "minisearch";

const globalPath = `/minisearch-feature/indexing.json`;

export const useSearchMinisearchData = create((set) => ({
  minisearch: null,
  error_msg: null,
  status_fetch: "idle",

  fetchDataIndexing: async () => {
    set({ status_fetch: "working", error_msg: null });
    try {
      const getdataIndexing = await fetch(globalPath, {
        cache: "force-cache",
        redirect: "follow",
      });
      set({ status_fetch: "success" });
      if (![200, 201, 202, 302, 305].includes(getdataIndexing.status)) {
        toast.error("Can't fetch data indexing!", {
          description: `File indexing have status ${getdataIndexing.status}`,
        });
        setTimeout(() => {
          set({ status_fetch: "idle" });
        }, 400);
        return;
      }
      const dataJsonIndexing = await getdataIndexing.json();
      const getDataPosts = dataJsonIndexing?.posts || [];
      if (!getDataPosts) {
        setTimeout(() => {
          set({ status_fetch: "idle" });
        }, 400);
        return;
      }
      const getKeyForField = Object.keys(getDataPosts[0]);
      const msinit = new MiniSearch({
        fields: [
          "title",
          "description",
          "category",
          "tags",
          "authorSearch",
          "dateSearch",
        ],
        storeFields: getKeyForField,
        idField: "slug",
        extractField: (doc, fieldName) => {
          if (fieldName === "authorSearch") {
            return doc.author?.map((a) => a.label).join(" ") || "";
          }
          if (fieldName === "dateSearch") {
            if (!doc.date) return "";
            const year = new Date(doc.date).getFullYear();
            return `${doc.date} ${year}`;
          }
          return MiniSearch.getDefault("extractField")(doc, fieldName);
        },
        searchOptions: {
          prefix: true,
          fuzzy: 0.2,
          boost: { title: 2 },
        },
      });
      msinit.addAll(getDataPosts);
      console.log("[useSearchMinisearch]: Success init!");
      set({ minisearch: msinit });
    } catch (e) {
      console.error("[Error useSearchMinisearchData]: Bad fetch", e.stack);
      set({
        error_msg: `Have issue fetch data, check on console browser and please report to dev/support, E: ${e.stack}`,
      });
    } finally {
      setTimeout(() => {
        set({ status_fetch: "idle" });
      }, 400);
    }
  },
}));
