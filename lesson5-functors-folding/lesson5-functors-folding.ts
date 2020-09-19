type FileTree<A> =
  | { type: "File"; value: A }
  | { type: "Directory"; left: FileTree<A>; right: FileTree<A> };

const file = <A>(value: A): FileTree<A> => ({
  type: "File",
  value
});

const directory = <A>(left: FileTree<A>, right: FileTree<A>): FileTree<A> => ({
  type: "Directory",
  left,
  right
});

const tree: FileTree<number> = directory(
  file(123),
  directory(file(789), directory(file(890), file(123)))
);

// map :: (a -> b) -> Tree A -> Tree B
const fmap = <A, B>(f: (a: A) => B, tree: FileTree<A>): FileTree<B> =>
  tree.type === "File"
    ? { ...tree, value: f(tree.value) }
    : {
        ...tree,
        left: fmap(f, tree.left),
        right: fmap(f, tree.right)
      };

console.log(fmap(a => a + 1, tree));

// fold :: (b -> a -> b) -> Tree A -> B -> B
const fold = <A, B>(f: (b: B, a: A) => B, tree: FileTree<A>, def: B): B => {
  if (tree.type === "File") {
    return f(def, tree.value);
  }
  const leftB = fold(f, tree.left, def);
  return fold(f, tree.right, leftB);
};

console.log(fold((b, a) => a + b, tree, 0));
