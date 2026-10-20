import { Fn_ReadingAllContent } from "./src/lib/posts/globals.js";

const useColor =
  process.env.NO_COLOR === undefined &&
  (process.stdout.isTTY || process.env.FORCE_COLOR === "1");

function colorize(text, code) {
  return useColor ? `\u001b[${code}m${text}\u001b[0m` : text;
}

function getPostName(post) {
  return (
    post.metadata?.slug || post.source?.replace(/\.mdx$/i, "") || "unknown-post"
  );
}

function formatValidationError(error) {
  if (/^image:/.test(error)) return "require image";
  if (/^title:/.test(error)) return "require title";
  if (/^description:/.test(error)) return "description to short";
  return error;
}

function getRequestedSections(args) {
  const availableSections = new Set(["--valid", "--unvalid", "--publish"]);
  const unknownArgs = args.filter((arg) => !availableSections.has(arg));

  if (unknownArgs.length > 0) {
    throw new Error(
      `Unknown option: ${unknownArgs.join(", ")}. Use --valid, --unvalid, and/or --publish.`,
    );
  }

  return args.length > 0 ? new Set(args) : availableSections;
}

async function validatePosts() {
  const requestedSections = getRequestedSections(process.argv.slice(2));
  console.log("Checking file validate...");

  const posts = await Fn_ReadingAllContent({
    filteringUnvalid: false,
    hiddenDraft: false,
    includeSource: true,
  });
  const validPosts = [];
  const invalidPosts = [];

  for (const post of posts) {
    const name = getPostName(post);
    if (post.unvalid) {
      const errors = post.errors || (post.error ? [post.error] : []);
      invalidPosts.push({
        name,
        errors: errors.map(formatValidationError),
      });
    } else {
      validPosts.push({
        name,
        draft: post.metadata?.draft === true,
      });
    }
  }

  console.log(
    `${colorize("[Status]", "36")} Post be valid ${colorize(
      `${validPosts.length}/${posts.length}`,
      "1;36",
    )}`,
  );
  if (requestedSections.has("--valid")) {
    console.log(`\n${colorize("Valid:", "1;32")}`);
    if (validPosts.length === 0) {
      console.log(colorize("_None_", "3;90"));
    } else {
      for (const post of validPosts) {
        const draftLabel = post.draft
          ? ` ${colorize("(on draft files)", "90")}`
          : "";
        console.log(`${colorize("[✓]", "32")} ${post.name}${draftLabel}`);
      }
    }
  }

  if (requestedSections.has("--unvalid")) {
    console.log(`\n${colorize("Unvalid:", "1;31")}`);
    if (invalidPosts.length === 0) {
      console.log(colorize("_None_", "3;90"));
    } else {
      for (const post of invalidPosts) {
        console.log(`${colorize("[✗]", "31")} ${post.name}`);
        for (const error of post.errors) {
          console.log(`    ${colorize("-", "31")} ${error}`);
        }
      }
    }
  }

  if (requestedSections.has("--publish")) {
    const publishedPosts = validPosts.filter((post) => !post.draft);
    console.log(`\n${colorize("Publish:", "1;34")}`);
    if (publishedPosts.length === 0) {
      console.log(colorize("_None_", "3;90"));
    } else {
      for (const post of publishedPosts) {
        console.log(`${colorize("[✓]", "34")} ${post.name}`);
      }
    }
  }
}

validatePosts().catch((error) => {
  console.error(
    `${colorize("[ERROR]", "1;31")} Could not validate posts:`,
    error,
  );
  process.exitCode = 1;
});
