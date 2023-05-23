import Head from "next/head";

// TODO: Fix linting to accept types
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