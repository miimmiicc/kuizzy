"use client"

import { useTheme } from "next-themes";
import React from "react";
import D3WordCloud from "react-d3-cloud";

type Props = {};

const data = [
    {
        text: "Hey",
        value: 3,
    },
    {
        text: "Hi",
        value: 5,
    },
    {
        text: "Computer",
        value: 10,
    },
    {
        text: "reactjs",
        value: 8,
    },
    {
        text: "live",
        value: 7,
    },

];

const fontSizeMapper = (word:  {value: number}) => {
    return Math.log2(word.value) * 5 + 16
}

const CustomWorldCloud = (props: Props) => {
    const theme = useTheme();
    return (
        <>
        <D3WordCloud 
            height={550}
            data={data}
            font = "Times"
            fontSize={fontSizeMapper}
            rotate={0}
            padding={10}
            fill={theme.theme == 'dark' ? 'white' : 'black'}
        />
        </>
    )
};

export default CustomWorldCloud;