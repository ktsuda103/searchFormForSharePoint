import * as React from 'react';
import styles from './SearchForm.module.scss';
import { ISearchFormProps } from './ISearchFormProps';
import { escape } from '@microsoft/sp-lodash-subset';
import * as jQuery from "jquery"; 
import * as bootstrap from "bootstrap"; 
require('../../../../node_modules/bootstrap/dist/css/bootstrap.min.css'); 

interface ISearchFormState {
  word: string;
}

export default class SearchForm extends React.Component<ISearchFormProps, ISearchFormState> {

  constructor(props:ISearchFormProps){
    super(props);
    this.props.onGetListItems();
    this.props.onGetCategory();
    this.state = {
      word: "検索用"
    }
  }
  
  itemCount = 0;
  
  search = (event: React.MouseEvent<HTMLButtonElement>):void => {
    event.preventDefault();

    const searchBox = document.getElementById("searchbox");
    console.log(this.state.word)
    this.props.search(this.state.word);
  }
  public render(): React.ReactElement<ISearchFormProps> {
    const {
      pageListItem,
      categoryList,
      hasTeamsContext,
    } = this.props;

    
    const pageNum = [];
    for(let i = 1; i < pageListItem.length % 10 +1; i++){
      pageNum.push(i);
    }

    return (
      <section className={`${styles.searchForm} display-flex row ${hasTeamsContext ? styles.teams : ''}`}>
        <div className={`${styles.searchForm} col-4 p-0`}>
          <label htmlFor="">カテゴリ検索</label>
          <ul className={styles.categoryList}>
            {categoryList && categoryList.map((classification)=>
              classification.ClassificationNum == null
              && <li key={classification.Id}>{classification.Title}
                <ul>
                  {categoryList.map((category)=>
                    classification.Id == category.ClassificationNum
                    && <><input type="checkbox" className="form-check-input" /><li>{category.Title}</li></>
                  )}
                </ul>
              </li>
            )}
          </ul>

          <label htmlFor="searchBox" className="form-label">フリーワード検索</label>
          <input type="text" id="searchBox" className="form-control" onChange={(event)=>this.setState({word:event.target.value})} />
          <div className={styles.buttons}>
            <button type="button" className="btn btn-primary" onClick={this.search}>検索</button>
          </div>
        </div>
        <div className={`${styles.searchResult} col-8`}>
          <table className="table">
            <thead>
              <tr>
                <th>タイトル</th>
                <th>カテゴリ</th>
                <th>BU</th>
                <th>REGION</th>
                <th>TS</th>
                <th>投稿日</th>
                <th>いいね数</th>
                <th>閲覧数</th>
                <th>コメント数</th>
              </tr>
            </thead>
            <tbody>
              {pageListItem && pageListItem.map((list, index)=>
                this.itemCount <= index && index < this.itemCount + 10
                &&<tr key={list.Id}>
                  <td><a href={`https://rocksystem.sharepoint.com/sites/tsuda_test3/SitePages/${list.Title}.aspx`}>{list.Title}</a></td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className={`${styles.pagenation} offset-4`}>
          {pageNum.map((num)=>
            <span key={num} id={`page${num}`} className={`${styles.page} text-primary`}>{num}</span>
          )}
          <span className={`${styles.page} text-primary`}>&gt;</span>
          <span className={`${styles.page} text-primary`}>≫</span>
        </div>
      </section>
    );
  }
} 
