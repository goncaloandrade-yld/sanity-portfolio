"use server";
import style from "./page.module.scss";
import "../../../styles/global.scss";
import portableTextImage from "../../utils/portableText/portableTextImage";
import sanityFetch from "../../utils/sanityFetch";
import { PortableText } from "@portabletext/react";
import TileGrid from "../../component/TileGrid/TileGrid";
import Tag from "../../component/Tag/Tag";
import colours from "../../../styles/_theme.module.scss";

export async function generateMetadata({ params, searchParams }, parent) {
  // read route params
  const slug = params.slug;

  // fetch data for metadata
  const dataArr = await sanityFetch({
    query: `*[_type == 'project' && slug.current == '${params.slug}'] {
  "color": colour.label,
  "imageUrl": image.asset->url,
  name,
  summary
}`,
  });
  const data = dataArr[0];

  // optionally access and extend (rather than replace) parent metadata
  // const previousImages = (await parent).openGraph?.images || [];

  return {
    title: `${data.name} - ${process.env.NEXT_PUBLIC_SITE_TITLE}`,
    description: `${data.summary}`,
    openGraph: {
      images: [
        `${data.imageUrl}?bg=${colours[
          `${data.color.charAt(0).toLowerCase()}${data.color
            .slice(1)
            .replace(" ", "")}`
        ].replace("#", "")}`,
      ],
    },
  };
}

const Project = async ({ params }) => {
  const dataArr = await sanityFetch({
    query: `*[_type == 'project' && slug.current == '${params.slug}'] {
  "color": colour.label,
  "imageUrl": image.asset->url,
  "slug": slug.current,
  "date": {
    "start": dateTime(startDate + 'T00:00:00Z'),
    "end": dateTime(endDate + 'T00:00:00Z'),
  },
  tools[]->{
    Name,
    "Slug": Slug.current,
    "imageUrl": image.asset->url
  },
  tags[]->{
    "name": Name,
    "slug": Slug.current
  },
  "relatedProjects": relatedProjects[]->{
    "imageUrl": image.asset->url,
    "slug": slug.current,
    name,
    "color": colour.label,
    tags[]-> {
      "name": Name,
      "slug": Slug.current
    }
  },
  name,
  summary,
  intro,
  role,
  "body": Body[]{
    ...,
    "asset": asset->{
      url,
      altText,
      title,
      "tags": opt.media.tags[]->name.current,
      "hasTransparency": metadata.hasAlpha
    },
  },
    company->{
      name,
      "slug": slug.current,
      "imageUrl": image.asset->url
    }
}`,
  });
  const data = dataArr[0];
  data.date.start = new Date(data.date.start).toLocaleDateString("en-gb", {
    month: "short",
    year: "numeric",
  });
  data.date.end = new Date(data.date.end).toLocaleDateString("en-gb", {
    month: "short",
    year: "numeric",
  });

  return (
    <article className={style.projectContainer}>
      <div className={`section unwhite`}>
        <div className={style.page}>
          <div className={style.hero}>
            <div className={style.featuredContainer}>
              <img
                className={`${style.featuredImage} ${
                  style[data.color.replace(" ", "")]
                }`}
                src={data.imageUrl}
                alt={`${data.name} header image`}
                title={`${data.name} header image`}
              />
            </div>
          </div>
          <div
            className={`${style.projectContainerInner} contained projectText`}
          >
            <h2>{data.name}</h2>
            <div className={style.metaContainer}>
              {data.tags && data.tags.length && (
                <div className={style.tagsContainer}>
                  {data.tags.map((tag, k) => (
                    <Tag key={k} data={tag} />
                  ))}
                </div>
              )}
              {data.intro && <p>{data.intro}</p>}
              <div className={style.metaContainerInner}>
                {data.company && (
                  <p>
                    <label>Company</label>
                    <img
                      src={data.company.imageUrl}
                      title={data.company.name}
                    />
                  </p>
                )}
                {data.role && (
                  <p>
                    <label>Role</label>
                    <span>{data.role}</span>
                  </p>
                )}
                {data.date && (
                  <p>
                    <label>Duration</label>
                    <span>
                      {data.date.start}
                      {data.date.start != data.date.end
                        ? `- ${data.date.end}`
                        : null}
                    </span>
                  </p>
                )}
              </div>
            </div>
            <PortableText value={data.body} components={portableTextImage} />
          </div>
        </div>
      </div>
      <div className="section unwhite">
        <div className="contained">
          <h2>You might also like</h2>
          <TileGrid data={data.relatedProjects} dropCap={false} />
        </div>
      </div>
    </article>
  );
};

export default Project;
