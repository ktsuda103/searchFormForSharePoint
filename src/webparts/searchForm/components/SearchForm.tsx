import * as React from 'react';
import styles from './SearchForm.module.scss';
import { ISearchFormProps } from './ISearchFormProps';
import { ISearchFormState } from '../../../models/ISearchFormState';
import { escape } from '@microsoft/sp-lodash-subset';
import * as jQuery from "jquery";
import * as bootstrap from "bootstrap";
require('../../../../node_modules/bootstrap/dist/css/bootstrap.min.css');

export default class SearchForm extends React.Component<ISearchFormProps, ISearchFormState> {

  constructor(props: ISearchFormProps) {
    super(props);
    this.props.onGetCategory();
    this.props.onGetClassification();
    this.props.onGetBU();
    this.props.onGetListItems();
    this.state = {
      word: "検索用",
      itemCount: 0,
      categoryCheckBox: [],
      buCheckBox: [],
    }
  }

  search = (event: React.MouseEvent<any>, status?: string): void => {
    event.preventDefault();
    this.props.search(this.state, status);
  }

  changeCategoryCheckBox = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (this.state.categoryCheckBox.filter(val => val == e.target.value).length > 0) {
      this.setState({ categoryCheckBox: this.state.categoryCheckBox.filter(item => item != e.target.value) })
    } else {
      this.setState({ categoryCheckBox: [...this.state.categoryCheckBox, e.target.value] })
    }
  }

  changeBUCheckBox = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (this.state.buCheckBox.filter(val => val == e.target.value).length > 0) {
      this.setState({ buCheckBox: this.state.buCheckBox.filter(item => item != e.target.value) })
    } else {
      this.setState({ buCheckBox: [...this.state.buCheckBox, e.target.value] })
    }
  }

  public render(): React.ReactElement<ISearchFormProps> {
    const {
      pageListItem,
      categoryList,
      classificationList,
      buList,
      hasTeamsContext,
    } = this.props;
    //ページネーション用
    const pageNum = [];
    for (let i = 1; i <= Math.ceil(pageListItem.length / 10); i++) {
      pageNum.push(i);
    }
    return (
      <section className={`${styles.searchForm} display-flex row ${hasTeamsContext ? styles.teams : ''}`}>
        {console.log("レンダリング")}
        <div className={`${styles.searchForm} col-12 p-0 row mb-3`}>
          <div className="categorySearch col-5">
            <label htmlFor="">カテゴリ検索</label>
            <ul className={styles.categoryList}>
              {classificationList && classificationList.map((classification) =>
                <li key={classification.Id}>{classification.Title}
                  <ul key={classification.Id}>
                    {categoryList.map((category) =>
                      classification.Id == category.classificationId
                      && <><input type="checkbox" className="form-check-input" id={category.Id} value={category.Title} onChange={(event) => this.changeCategoryCheckBox(event)} /><li >{category.Title}</li></>
                    )}
                  </ul>
                </li>
              )}
            </ul>
          </div>
          <div className="buSearch col-3">
            <label htmlFor="">BU検索</label>
            <ul className={styles.buList}>
              {buList && buList.map((bu) =>
                <li key={bu.Id}>
                  <><input type="checkbox" className="form-check-input" id={bu.Id} value={bu.Title} onChange={(event) => this.changeBUCheckBox(event)} /><li >{bu.Title}</li></>
                </li>
              )}
            </ul>
          </div>
          <div className='freeWordSearch col-4'>
            <label htmlFor="searchBox" className="form-label">フリーワード検索</label>
            <input type="text" id="searchBox" className="form-control" onChange={(event) => this.setState({ word: event.target.value })} />
          </div>
          <div className={`${styles.buttons} offset-8`}>
            <button type="button" className="btn btn-primary" onClick={e => this.search(e, "clickSearchButton")}>検索</button>
          </div>
        </div>
        <div className={`${styles.searchResult} col-12`}>
          <table className="table">
            <thead>
              <tr>
                <th>タイトル</th>
                <th>カテゴリ</th>
                <th>BU</th>
                <th>REGION</th>
                <th>TS</th>
                <th>投稿日</th>
                <th>いいね数<span onClick={(e) => this.search(e, "likeCountSort")}>●</span></th>
                <th>コメント数<span onClick={(e) => this.search(e, "commentCountSort")}>●</span></th>
                <th>閲覧数</th>
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
                  <td>{list.Created.substring(0, 10)}</td>
                  {/* いいね */}
                  <td>{list.LikeCount}</td>
                  {/* コメント数 */}
                  <td>{list.CommentCount}</td>
                  {/* 閲覧数 */}
                  <td>閲覧数</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className={`${styles.pagenation}`}>
          {pageNum.map((num) =>
            <span key={num} id={`page${num}`} className={`${styles.page} text-primary`} onClick={() => this.setState({ itemCount: 10 * (num - 1) })}>{num}</span>
          )}
          <span className={`${styles.page} text-primary`}>&gt;</span>
          <span className={`${styles.page} text-primary`}>&gt;&gt;</span>
        </div>
      </section>
    );
  }
} 
