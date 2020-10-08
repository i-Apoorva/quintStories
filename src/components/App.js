import React, {Component} from 'react';
let Parser = require('rss-parser');
import logo from '../assets/images/quint-logo.jpg';
import axios from 'axios';
let parser = new Parser();

const CORS_PROXY = "https://cors-anywhere.herokuapp.com/";
const RSS_URL = "https://www.thequint.com/stories.rss"
const STORIES_API ="https://www.thequint.com/api/v1/stories"

class App extends Component {
    constructor() {
        super();
        this.state = { feedData: [], stories: [] };
   }
    
    async componentDidMount() {
        const feed = await parser.parseURL(CORS_PROXY+ RSS_URL);
        const response = await axios.get(CORS_PROXY+STORIES_API);
        const stories = response.data;
        this.removeLinks(feed.items)
        this.addImages(feed.items, stories.stories)
    }


    removeLinks = (feedData)=>{ 
       feedData.forEach(el =>{
        el["content:encoded"]= el["content:encoded"].replaceAll(/<a\b[^>]*>(.*?)<\/a>/ig, "");
        el["content:encoded"]= el["content:encoded"].replaceAll("Also Read:", "");
        el.pubDate = el.pubDate.replace("+0530", "IST");
      })
      this.setState({feedData})
    }

    addImages = (feedData, stories)=> {
      feedData.forEach((el, i) => {
        let x= stories.filter(story => story.id === el.guid)
          if(x.length){
              el.imageUrl = "https://images.thequint.com/" + x[0]["hero-image-s3-key"]
          }
      })
      this.setState({feedData});
      console.log({feedData});
    }


    render() {
        if (this.state.feedData.length) {
            return (
                <div>
                    {
                        this.state.feedData.map((item, i) => (
                            <div key={i}>
                                <h3 className="st-title">{item.title}</h3>
                                <h5>Updated: {item.pubDate}</h5>
                                <div>
                                    {item.imageUrl ?
                                        <img src={item.imageUrl} data-src={item.imageUrl} alt="story image" data-was-processed="true" /> : null

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
                        ))
                    }

                </div>
            )
        }

        return (
            <img src="https://upload.wikimedia.org/wikipedia/commons/b/b1/Loading_icon.gif" />
        )
    }
}
export default App;