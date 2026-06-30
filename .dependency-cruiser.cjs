/** Garde-fous d'architecture hexagonale (AD-2, AD-3).
 *  Le domaine est pur ; les couches respectent la direction ; les contextes restent étanches. */
module.exports = {
  forbidden: [
    {
      name: "domain-pure",
      comment: "AD-2 : le domaine est pur — aucun import de dépendance externe ni des couches supérieures.",
      severity: "error",
      from: { path: "^src/[^/]+/domain/" },
      to: { path: "(^src/[^/]+/(application|infrastructure)/|/node_modules/)" }
    },
    {
      name: "application-no-infrastructure",
      comment: "AD-2 : l'application (use-cases) dépend de ports, pas d'adapters concrets.",
      severity: "error",
      from: { path: "^src/[^/]+/application/" },
      to: { path: "^src/[^/]+/infrastructure/" }
    },
    {
      name: "no-cross-context-internals",
      comment: "AD-3 : un contexte n'importe jamais le code interne d'un autre contexte (sauf shared-kernel).",
      severity: "error",
      from: { path: "^src/([^/]+)/" },
      to: { path: "^src/([^/]+)/(domain|application|infrastructure)/", pathNot: ["^src/$1/", "^src/shared-kernel/"] }
    }
  ],
  options: { doNotFollow: { path: "node_modules" }, tsConfig: { fileName: "tsconfig.json" } }
};
