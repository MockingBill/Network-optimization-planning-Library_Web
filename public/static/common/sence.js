
var scene={
    direct:[
        {value:"全部",text:"全部"},
        {value:"凯里市",text:"凯里市"},
        {value:"从江县",text:"从江县"},
        {value:"岑巩县",text:"岑巩县"},
        {value:"丹寨县",text:"丹寨县"},
        {value:"黄平县",text:"黄平县"},
        {value:"锦屏县",text:"锦屏县"},
        {value:"雷山县",text:"雷山县"},
        {value:"黎平县",text:"黎平县"},
        {value:"榕江县",text:"榕江县"},
        {value:"剑河县",text:"剑河县"},
        {value:"台江县",text:"台江县"},
        {value:"镇远县",text:"镇远县"},
        {value:"施秉县",text:"施秉县"},
        {value:"麻江县",text:"麻江县"},
        {value:"三穗县",text:"三穗县"},
        {value:"天柱县",text:"天柱县"}
        ],
    typeData: [
        {value: '全部', text: '全部'},
        {value: '城区', text: '城区'},
        {value: '乡镇', text: '乡镇'},
        {value: '农村', text: '农村'},
        {value: '交通', text: '交通'}
    ],
    //城区
    //city
        options01: [
        {text: "全部", value: "全部"},
        {text: "学校", value: "学校"},
        {text: "商业区", value: "商业区"},
        {text: "景区", value: "景区"},
        {text: "党政军", value: "党政军"},
        {text: "住宅", value: "住宅"},
        {text: "医院", value: "医院"},
        {text: "酒店", value: "酒店"},
        {text: "企事业单位",value:"企事业单位"}
    ],
    //乡镇
    //town
        options02: [
        {text: "全部", value: "全部"},
        {text: "住宅区", value: "住宅区"},
        {text: "景区", value: "景区"},
        {text: "党政军", value: "党政军"},
        {text: "商业区", value: "商业区"},
        {text: "企事业单位", value: "企事业单位"},
        {text: "学校", value: "学校"}
    ],
    //农村
    //countryside
        options03: [
        {text: "全部", value: "全部"},
        {text: "行政村",value: "行政村"},
        {text: "村寨", value: "村寨"},
        {text: "景区", value: "景区"},
        {text: "学校", value: "学校"}
    ],
    //交通
    //transportation
        options04: [
        {text: "全部", value: "全部"},
        {text: "高速", value: "高速"},
        {text: "车站", value: "车站"},
        {text: "高铁", value: "高铁"},
        {text: "公路", value: "公路"},
        {text: "机场", value: "机场"}

    ],
    FromDepartmentData:[
        {text:"综合部",value:"综合部"},
        {text:"人力资源部",value:"人力资源部"},
        {text:"财务部",value:"财务部"},
        {text:"纪检监察室",value:"纪检监察室"},
        {text:"党委办公室",value:"党委办公室"},
        {text:"工会",value:"工会"},
        {text:"计划建设部",value:"计划建设部"},
        {text:"网络部",value:"网络部"},
        {text:"市场销售部",value:"市场销售部"},
        {text:"政企事业部",value:"政企事业部"},
        {text:"岑巩县公司",value:"岑巩县"},
        {text:"从江县公司",value:"从江县"},
        {text:"丹寨县公司",value:"丹寨县"},
        {text:"黄平县公司",value:"黄平县"},
        {text:"剑河县公司",value:"剑河县"},
        {text:"锦屏县公司",value:"锦屏县"},
        {text:"凯里市公司",value:"凯里市"},
        {text:"雷山县公司",value:"雷山县"},
        {text:"黎平县公司",value:"黎平县"},
        {text:"麻江县公司",value:"麻江县"},
        {text:"榕江县公司",value:"榕江县"},
        {text:"三穗县公司",value:"三穗县"},
        {text:"施秉县公司",value:"施秉县"},
        {text:"台江县公司",value:"台江县"},
        {text:"天柱县公司",value:"天柱县"},
        {text:"镇远县公司",value:"镇远县"}
    ]


};
function readScene() {
    return scene;
}