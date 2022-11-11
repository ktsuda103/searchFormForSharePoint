import * as React from 'react';
import styles from './SearchForm.module.scss';
import { ISearchFormProps } from './ISearchFormProps';
import { escape } from '@microsoft/sp-lodash-subset';
import * as jQuery from "jquery";
import * as bootstrap from "bootstrap";
require('../../../../node_modules/bootstrap/dist/css/bootstrap.min.css');

interface ISearchFormState {
  word: string;
  itemCount: number;
}

export default class SearchForm extends React.Component<ISearchFormProps, ISearchFormState> {

  constructor(props: ISearchFormProps) {
    super(props);
    this.props.onGetListItems();
    this.props.onGetCategory();
    this.props.onGetClassification();
    this.state = {
      word: "検索用",
      itemCount: 0
    }
  }

  search = (event: React.MouseEvent<HTMLButtonElement>): void => {
    event.preventDefault();
    this.props.search(this.state.word);
  }
  public render(): React.ReactElement<ISearchFormProps> {
    const {
      pageListItem,
      categoryList,
      classificationList,
      hasTeamsContext,
    } = this.props;

    //ページネーション
    const pageNum = [];
    for (let i = 1; i <= Math.ceil(pageListItem.length / 10); i++) {
      pageNum.push(i);
    }
    return (
      <section className={`${styles.searchForm} display-flex row ${hasTeamsContext ? styles.teams : ''}`}>
        <div className={`${styles.searchForm} col-4 p-0`}>
          <label htmlFor="">カテゴリ検索</label>
          <ul className={styles.categoryList}>
            {classificationList && classificationList.map((classification) =>
              <li key={classification.Id}>{classification.Title}
                <ul key={classification.Id}>
                  {categoryList.map((category) =>
                    classification.Id == category.classificationId
                    && <><input type="checkbox" className="form-check-input" id={category.Id} value={category.Title} /><li >{category.Title}</li></>
                  )}
                </ul>
              </li>
            )}
          </ul>

          <label htmlFor="searchBox" className="form-label">フリーワード検索</label>
          <input type="text" id="searchBox" className="form-control" onChange={(event) => this.setState({ word: event.target.value })} />
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
                <th>コメント数</th>
              </tr>
            </thead>
            <tbody>
              {pageListItem && pageListItem.map((list, index) =>
                this.state.itemCount <= index && index < this.state.itemCount + 10
                && <tr key={list.Id}>
                  {/* タイトル */}
                  <td><a href={`https://mirainorock.sharepoint.com/sites/sample/SitePages/${list.Title}.aspx`}>{list.Title}</a></td>
                  {/* カテゴリ */}
                  <td>
                    {list.categoryId.map((id) =>
                      <>{categoryList.filter(element => element.Id == id)[0].Title}<br /></>
                    )}
                  </td>
                  {/* BU */}
                  <td>BU</td>
                  {/* REGION */}
                  <td>REGION</td>
                  {/* TS */}
                  <td>TS</td>
                  {/* 投稿日 */}
                  <td>{list.Created}</td>
                  {/* いいね */}
                  <td>いいね数</td>
                  {/* コメント数 */}
                  <td>コメント数</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className={`${styles.pagenation} offset-4`}>
          {pageNum.map((num) =>
            <span key={num} id={`page${num}`} className={`${styles.page} text-primary`} onClick={() => this.setState({ itemCount: 10 * (num - 1) })}>{num}</span>
          )}
          <span className={`${styles.page} text-primary`}>&gt;</span>
          <span className={`${styles.page} text-primary`}>≫</span>
        </div>
      </section>
    );
  }
} 
