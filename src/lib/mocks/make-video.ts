import { faker } from "@faker-js/faker/locale/pt_BR";

import {
   type Comment,
   type Like,
   LikeType,
   type Subscription,
   type Video,
   VideoSegment,
   Visibility,
} from "../../../generated/prisma";

import { prisma } from "../prisma";

import { makeUser } from "./make-user";

export const getVideosMock = async (
   count: number,
): Promise<Video[]> =>
   Promise.all(
      Array.from({ length: count }, () =>
         getVideoMock(),
      ),
   );

export const getVideoMock = async (
   userId?: string,
): Promise<Video> => {
   const ownerId =
      userId ||
      (await makeUser()).user.id;

   return await prisma.video.create({
      data: {
         title: `Vídeo ${faker.lorem.sentence()}`,

         description:
            faker.lorem.paragraphs(3),

         videoUrl:
            faker.internet.url(),

         thumbnailUrl: `https://picsum.photos/300/200?random=${faker.number.int(
            {
               min: 1,
               max: 1000,
            },
         )}`,

         duration: `${faker.number.int({
            min: 1,
            max: 59,
         })}:${faker.number.int({
            min: 10,
            max: 59,
         })}`,

         views: faker.number.int({
            min: 0,
            max: 1000000,
         }),

         visibility:
            faker.helpers.enumValue(
               Visibility,
            ),

         segment:
            faker.helpers.enumValue(
               VideoSegment,
            ),

         tags:
            faker.helpers.arrayElements(
               [
                  "React",
                  "Next.js",
                  "TypeScript",
                  "Node.js",
                  "Prisma",
                  "Tailwind",
                  "JavaScript",
                  "Frontend",
                  "Backend",
                  "Fullstack",
               ],
               {
                  min: 2,
                  max: 5,
               },
            ),

         userId: ownerId,

         publishedAt:
            faker.date.past(),

         createdAt:
            faker.date.past(),
      },
   });
};

export const commentMock =
   async (): Promise<Comment> => {
      const video =
         await getVideoMock();

      const { user } =
         await makeUser();

      return await prisma.comment.create({
         data: {
            content:
               faker.lorem.paragraph(),

            authorId: user.id,

            videoId: video.id,

            createdAt:
               faker.date.recent(),
         },
      });
   };

export const likeVideoMock =
   async (): Promise<Like> => {
      const video =
         await getVideoMock();

      const { user } =
         await makeUser();

      const existingLike =
         await prisma.like.findFirst({
            where: {
               userId: user.id,
               videoId: video.id,
            },
         });

      if (existingLike) {
         return existingLike;
      }

      return await prisma.like.create({
         data: {
            type: LikeType.VIDEO,

            userId: user.id,

            videoId: video.id,

            createdAt:
               faker.date.recent(),
         },
      });
   };

export const likeCommentMock =
   async (): Promise<Like> => {
      const comment =
         await commentMock();

      const { user } =
         await makeUser();

      const existingLike =
         await prisma.like.findFirst({
            where: {
               userId: user.id,
               commentId: comment.id,
            },
         });

      if (existingLike) {
         return existingLike;
      }

      return await prisma.like.create({
         data: {
            type: LikeType.COMMENT,

            userId: user.id,

            commentId: comment.id,

            createdAt:
               faker.date.recent(),
         },
      });
   };

export const subscriptionMock =
   async (): Promise<Subscription> => {
      const subscriber =
         await makeUser();

      const subscribedTo =
         await makeUser();

      const existingSubscription =
         await prisma.subscription.findFirst({
            where: {
               subscriberId:
                  subscriber.user.id,

               subscribedToId:
                  subscribedTo.user.id,
            },
         });

      if (existingSubscription) {
         return existingSubscription;
      }

      return await prisma.subscription.create({
         data: {
            subscriberId:
               subscriber.user.id,

            subscribedToId:
               subscribedTo.user.id,

            createdAt:
               faker.date.recent(),
         },
      });
   };

export const completeUserMock =
   async () => {
      const { user } =
         await makeUser();

      const videos =
         await getVideosMock(3);

      const comments =
         await Promise.all([
            commentMock(),
            commentMock(),
            commentMock(),
         ]);

      const likes =
         await Promise.all([
            likeVideoMock(),
            likeCommentMock(),
         ]);

      const subscriptions =
         await Promise.all([
            subscriptionMock(),
            subscriptionMock(),
         ]);

      return {
         user,
         videos,
         comments,
         likes,
         subscriptions,
      };
   };