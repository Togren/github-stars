import Head from "next/head";

type HeadComponentPropsType = {
    title: string;
    metaData: string;
}

const HeadComponent = ({title, metaData}: HeadComponentPropsType) => {
    return (
        <Head>
            <title>{title}</title>
            <meta name="description" content={metaData} />
        </Head>
    )
}

export default HeadComponent;