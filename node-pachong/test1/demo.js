const https = require('https');
const cheerio = require('cheerio');
const fs = require('fs')

class data {

    constructor(page){
        this.currentPage = 1;
        this.page = page;
       
        this.baseUrl = 'https://www.liepin.com/zhaopin/?isAnalysis=&dqs=&pubTime=&salary=&subIndustry=&industryType=&compscale=&key=%E5%89%8D%E7%AB%AF%E5%BC%80%E5%8F%91&init=-1&searchType=1&headckid=b41b3a1f788e456c&compkind=&fromSearchBtn=2&sortFlag=15&ckid=e0769e995864e9e1&degradeFlag=0&jobKind=&industries=&clean_condition=&siTag=D_7XS8J-xxxQY6y2bMqEWQ%7EfA9rXquZc5IkJpXC-Ycixw&d_sfrom=search_prime&d_ckId=ec6119ede4a8421d04cde68240799352&d_curPage=';
        this.init();
    }

    init(){
        let _self = this;

        let time = setInterval(function() {
            
            if(_self.currentPage > _self.page){
                clearInterval(time);
            }else{
                console.log('第'+ _self.currentPage+'个爬虫请求发出');
                _self.getDataPackage(_self.baseUrl + (_self.currentPage + 1) + '&d_pageSize=40&d_headId=ad878683a46e56bca93e6f921e59a95&curPage=' + _self.currentPage);
                _self.currentPage ++;
            }
        },1000*5)
    }


    getDataPackage(url) {
        

        https.get(url, function (res) {
            let chunks = [],
                size = 0;
            res.on('data', function (chunk) {
                chunks.push(chunk);
                size += chunk.length;
            });
        
            res.on('end', function () {
                console.log('数据包传输完毕');
                let data = Buffer.concat(chunks, size);
                let html = data.toString();
        
                let $ = cheerio.load(html);
        
                let result = [];
        
                $('.sojob-list').find('.job-info').each(i => {
                    let map = {};
        
                    map.name = $('.job-info').eq(i).find('h3').attr('title');
        
                    let baseOthersInfo = $('.job-info').eq(i).find('.condition').attr('title');
                    baseOthersInfo = baseOthersInfo.split("_");
        
                    map.reward = baseOthersInfo[0];
                    map.area = baseOthersInfo[1];
                    map.experience = baseOthersInfo[2];
        
                    //公司信息
                    let companyTagDom = $('.company-info').eq(i).find('.temptation').find('span');
                    let companyTag = [];
                    companyTagDom.each(i => {
                        companyTag.push(companyTagDom.eq(i).text());
                    })
        
                    let companyInfo = {
                        name: $('.company-info').eq(i).find('.company-name a').attr('title'),
                        href: $('.company-info').eq(i).find('.company-name a').attr('href'),
                        type: $('.company-info').eq(i).find('.industry-link a').text(),
                        tag: companyTag.join(',')
                    }
        
                    map.company = companyInfo;
                    result.push(map);
                    map = {};
                })
                let res = JSON.stringify(result)
                fs.writeFile('F:/test.txt',res,function(){
                    console.log("写入成功！")
                });
                
            });
        })
    }
}

new data(99);







