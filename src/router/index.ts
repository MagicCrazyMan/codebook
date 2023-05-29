// Composables
import { RouteRecordRaw, createRouter, createWebHistory } from "vue-router";

/**
 * Route names
 */
export enum RouteName {
  Guideline = "guideline",
  Viewer = "viewer",
}

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: RouteName.Guideline,
    component: () => import("../views/Guideline.vue"),
  },
  {
    path: "/:chapters+",
    name: RouteName.Viewer,
    component: () => import("../views/Viewer.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;

/**
 * Jumps to guideline page
 */
export const toGuideline = () => {
  router.push({ name: RouteName.Guideline });
};

/**
 * Jumps to chapter viewer page by full entry
 * @param fullEntry Full entry
 */
export const toChapter = (fullEntry: string) => {
  router.push({
    path: fullEntry,
  });
};
