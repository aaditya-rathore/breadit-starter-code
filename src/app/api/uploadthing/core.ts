import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { getAuthSession } from "@/lib/auth";


 
const f = createUploadthing();
 
const auth = async () => {
  const session = await getAuthSession();
  return session?.user ? { id: session.user.id } : null;
};
 
export const ourFileRouter = {

  imageUploader: f({ image: { maxFileSize: "4MB" } })
   
    .middleware(async () => {
      const user = await auth();
 
      
      if (!user) throw new UploadThingError("Unauthorized");
 
      return { userId: user.id };
    })
    .onUploadComplete(async () => {}),
} satisfies FileRouter
 
export type OurFileRouter = typeof ourFileRouter;
