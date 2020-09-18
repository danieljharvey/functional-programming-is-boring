type FileTree<W, A> =
  | { type: "File"; value: A; annotation: W | null }
  | { type: "Directory"; leaves: FileTree<W, A>[]; annotation: W | null };

const file = <W, A>(value: A, annotation?: W): FileTree<W, A> => ({
  type: "File",
  value,
  annotation: annotation || null
});

const directory = <W, A>(
  leaves: FileTree<W, A>[],
  annotation?: W
): FileTree<W, A> => ({
  type: "Directory",
  leaves,
  annotation: annotation || null
});

const tree: FileTree<string, number> = directory(
  [
    file(123, "filey boy"),
    file(456, "filey log"),
    directory([file(789, "oh no"), directory([file(890)], "More stuff")])
  ],
  "This is the root folder"
);

// map :: (a -> b) -> Tree W A -> Tree W B
const fmap = <W, A, B>(f: (a: A) => B, tree: FileTree<W, A>): FileTree<W, B> =>
  tree.type === "File"
    ? { ...tree, value: f(tree.value) }
    : {
        ...tree,
        leaves: tree.leaves.map((leaf: FileTree<W, A>) => fmap(f, leaf))
      };

console.log(fmap(a => a + 1, tree));
