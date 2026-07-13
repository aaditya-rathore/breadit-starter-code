const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
async function main() {
  const posts = await prisma.post.findMany({ select: { id: true, content: true } });
  for (const post of posts) {
    if (!post.content) continue;
    let data = typeof post.content === "string" ? JSON.parse(post.content) : post.content;
    if (data && data.blocks) {
      for (const block of data.blocks) {
        if (block.type === "linkTool") {
           console.log("LinkTool block found in post:", post.id);
           console.log(JSON.stringify(block, null, 2));
        }
      }
    }
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
