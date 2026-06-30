<script setup lang="ts">
import {
  LayoutDashboard, Building2, Users, PlusCircle, LogOut, Bell, Menu, X, Pencil, Clock,
  RotateCcw, ShieldCheck, Receipt, Banknote, Check, User, ChevronRight
} from "lucide-vue-next";

const registry: Record<string, unknown> = {
  "layout-dashboard": LayoutDashboard, "building-2": Building2, users: Users, "plus-circle": PlusCircle,
  "log-out": LogOut, bell: Bell, menu: Menu, x: X, pencil: Pencil, clock: Clock, "rotate-ccw": RotateCcw,
  "shield-check": ShieldCheck, receipt: Receipt, banknote: Banknote, check: Check, user: User,
  "chevron-right": ChevronRight
};
const props = defineProps<{ name: string; size?: number }>();
const cmp = computed(() => registry[props.name] ?? null);
</script>
<template>
  <component :is="cmp" v-if="cmp" :size="size ?? 18" :stroke-width="1.75" aria-hidden="true" />
</template>
