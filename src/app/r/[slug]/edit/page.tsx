// import { useRouter } from "next/router";
// import { useQuery, useMutation } from "@tanstack/react-query";
// import axios from "axios";
// import Editor from "@/components/editorComponents/Editor";
// import { toast } from "@/hooks/use-toast";

// const Page = () => {
//   // get the router object
//   const router = useRouter();

//   // get the post id and subreddit name from the query parameters
//   const { id, slug } = router.query;

//   // use the query hook to fetch the post data
//   const { data: post, isLoading } = useQuery(
//     ["post", id],
//     async () => {
//       const { data } = await axios.get(`/api/posts/${id}`);
//       return data;
//     },
//     { enabled: !!id }
//   );

//   // use the mutation hook to perform the update request
//   const { mutateAsync } = useMutation({
//     mutationFn: async (data) => {
//       const { data: updatedPost } = await axios.put(
//         `/api/posts/${id}`,
//         data
//       );
//       return updatedPost;
//     },
//     onSuccess: () => {
//       // go back to the previous page after updating the post
//       router.back();
//       toast({
//         description: "Your post was successfully updated.",
//       });
//     },
//     onError: () => {
//       toast({
//         title: "Something went wrong.",
//         description: "Your post was not updated, please try again later.",
//         variant: "destructive",
//       });
//     },
//   });

//   // handle the form submission
//   const handleSubmit = async (data) => {
//     try {
//       await mutateAsync(data);
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   if (isLoading) return <div>Loading...</div>;

//   return (
//     <div className="flex flex-col items-start gap-6">
//       <div className="border-b border-gray-200 pb-5">
//         <div className="-ml-2 -mt-2 flex flex-wrap items-baseline">
//           <h3 className="ml-2 mt-2 text-base font-semibold leading-6 text-gray-900">
//             Edit Post
//           </h3>
//           <p className="ml-2 mt-1 truncate text-sm text-gray-500">
//             in r/{slug}
//           </p>
//         </div>
//       </div>

//       {/* form */}
//       <Editor
//         subredditId={post.subredditId}
//         onSubmit={handleSubmit}
//         defaultValues={{
//           title: post.title,
//           content: post.content,
//         }}
//       />
//     </div>
//   );
// };

// export default Page;