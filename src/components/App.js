import React, { Component } from 'react';
let Parser = require('rss-parser');
import logo from '../assets/images/quint-logo.jpg';
import LazyLoad, {lazyload} from 'react-lazyload';
import axios from 'axios';
let parser = new Parser();

const CORS_PROXY = "https://cors-anywhere.herokuapp.com/";
const RSS_URL = "https://www.thequint.com/stories.rss"
const STORIES_API = "https://www.thequint.com/api/v1/stories"


class App extends Component {
    constructor() {
        super();
        this.state = {
            feedData: [],
            stories: [],
            feed: [],
            noData: true
        };
    }

    async componentDidMount() {
        try {
            const feed = await parser.parseURL(CORS_PROXY + RSS_URL);
            const response = await axios.get(CORS_PROXY + STORIES_API);
            const stories = response.data;
            if (!feed.items) {
                this.setState({feed: feed, noData: true}) 
              } else {
                this.setState({
                  noData: false
                })
            }
            this.removeLinks(feed.items)
            this.addImages(feed.items, stories.stories)
            this.setState({stories: stories.stories, feed})
        } catch (error) {
            console.log(error);
        }
    }


    removeLinks = (feedData) => {
        feedData.forEach(el => {
            el["content:encoded"] = el["content:encoded"].replaceAll(/<a\b[^>]*>(.*?)<\/a>/ig, "")
                .replaceAll("Also Read:", "").replaceAll(/<iframe.+?<\/iframe>/g, "");
                // .replaceAll(/<img[^>]*>/g, "")
            el.pubDate = el.pubDate.replace("+0530", "IST");
        })
        this.setState({ feedData })
    }

    addImages = (feedData, stories) => {
        feedData.forEach((el, i) => {
            let x = stories.filter(story => story.id === el.guid)
            if (x.length) {
                el.imageUrl = "https://images.thequint.com/" + x[0]["hero-image-s3-key"]
                el.author = x[0]["author-name"];
            }

        })
        this.setState({ feedData });
    }


    render() {
      let loader= <img src="https://upload.wikimedia.org/wikipedia/commons/b/b1/Loading_icon.gif" />;
        
        if(!this.state.feedData.length) {
            return (
                <img src="https://upload.wikimedia.org/wikipedia/commons/b/b1/Loading_icon.gif" />
            )
          }

            return (
                <div>
                    {
                        this.state.feedData.map((item, i) => (
                            <LazyLoad key={i} placeholder={loader} height={200} offset={-100}>
                            <div key={i}>
                                <h3 className="st-title">{item.title}</h3>
                                <h5>Updated: {item.pubDate} &nbsp; &nbsp; Author: {item.author}</h5>
                                
                                <div>
                                    {item.imageUrl ?
                                    <LazyLoad height={200} once >
                                        <img src={item.imageUrl} data-src={item.imageUrl} alt="story image" data-was-processed="true" /> 
                                        </LazyLoad>
                                        : null
                                        
                                    }
                                </div>
                                <div dangerouslySetInnerHTML={{ __html: item["content:encoded"] }} />
                                <div className="logo-style">
                                    <div>Go to Article:  </div>
                                    <a href={item.link} className="logo-url" aria-label="Link to Quint story home page">
                                        <img src={logo} data-src={logo} alt="Quint Logo" className="logo" data-was-processed="true" />
                                    </a>

                                </div>
                                
                            </div>
            </LazyLoad>
                        ))
                                }

                </div>
            )
        

        
    }
}
export default App;