import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { IReadonlyTheme } from '@microsoft/sp-component-base';

import * as strings from 'SearchFormWebPartStrings';
import SearchForm from './components/SearchForm';
import { ISearchFormProps } from './components/ISearchFormProps';

import { SPHttpClient } from '@microsoft/sp-http';
import { ICategory, IPageListItem, IClassification, IBU, ISearchFormState } from '../../models';

export interface ISearchFormWebPartProps {
  description: string;
}

export default class SearchFormWebPart extends BaseClientSideWebPart<ISearchFormWebPartProps> {

  private _isDarkTheme: boolean = false;
  private _environmentMessage: string = '';
  private _pages: IPageListItem[] = [];
  private _categoryList: ICategory[] = [];
  private _classificationList: IClassification[] = [];
  private _buList: IBU[] = [];

  public render(): void {
    const element: React.ReactElement<ISearchFormProps> = React.createElement(
      SearchForm,
      {
        pageListItem: this._pages,
        categoryList: this._categoryList,
        classificationList: this._classificationList,
        buList: this._buList,
        onGetListItems: this._onGetListItems,
        search: this._search,
        onGetCategory: this._onGetCategory,
        onGetClassification: this._onGetClassification,
        onGetBU: this._onGetBU,
        isDarkTheme: this._isDarkTheme,
        environmentMessage: this._environmentMessage,
        hasTeamsContext: !!this.context.sdks.microsoftTeams,
        userDisplayName: this.context.pageContext.user.displayName
      }
    );

    ReactDom.render(element, this.domElement);
  }

  private _onGetCategory = async (): Promise<void> => {
    const response: ICategory[] = await this._getCategory();
    this._categoryList = response;
    await this._categoryList.sort((a, b) => this._sortAscending(a.priority, b.priority))
  }

  private async _getCategory(): Promise<ICategory[]> {
    const response = await this.context.spHttpClient.get(
      this.context.pageContext.web.absoluteUrl + `/_api/web/lists/getbytitle('category')/items?$select=Id,Title,classificationId,priority`,
      SPHttpClient.configurations.v1
    );

    if (!response.ok) {
      const responseText = await response.text();
      throw new Error(responseText);
    }

    const responseJson = await response.json();

    return responseJson.value as ICategory[];
  }

  private _onGetClassification = async (): Promise<void> => {
    const response: IClassification[] = await this._getClassification();
    this._classificationList = response;
    await this._classificationList.sort((a, b) => this._sortAscending(a.priority, b.priority))
  }

  private _getClassification = async (): Promise<IClassification[]> => {
    const response = await this.context.spHttpClient.get(
      this.context.pageContext.web.absoluteUrl + `/_api/web/lists/getbytitle('classification')/items?$select=Id,Title,priority`,
      SPHttpClient.configurations.v1
    );

    if (!response.ok) {
      const responseText = await response.text();
      throw new Error(responseText);
    }

    const responseJson = await response.json();

    return responseJson.value as ICategory[];
  }

  private _onGetBU = async (): Promise<void> => {
    const response: IBU[] = await this._getBU();
    this._buList = response;
  }

  private async _getBU(): Promise<IBU[]> {
    const response = await this.context.spHttpClient.get(
      this.context.pageContext.web.absoluteUrl + `/_api/web/lists/getbytitle('bu')/items?$select=Id,Title`,
      SPHttpClient.configurations.v1
    );

    if (!response.ok) {
      const responseText = await response.text();
      throw new Error(responseText);
    }

    const responseJson = await response.json();

    return responseJson.value as IBU[];
  }

  private _onGetListItems = async (): Promise<void> => {
    const response: IPageListItem[] = await this._getListItems();
    //一時保存
    const tmp: IPageListItem[] = [];
    //インスタンスを一時退避
    const instance = this;

    response.forEach(async function (list) {
      if (list.Title != null && list.Title != "ホーム") {
        await instance._setLikeCount(list)
        await instance._setCommentCount(list)
        await instance.pushArr(tmp, list)
      }
      // list.Title != null
      //   && list.Title != "ホーム"
      //   && instance._setLikeCount(list)
      //   && instance._setCommentCount(list)
      //   && instance.pushArr(tmp, list)
    })
    tmp.sort((a, b) => this._sortDescending(a.Created, b.Created))
    this._pages = tmp;
    this.render();
  }



  private _search = async (state: ISearchFormState, status?: string): Promise<void> => {
    const response: IPageListItem[] = await this._getListItems();
    //一時保存
    const tmp: IPageListItem[] = [];
    //インスタンスを一時退避
    const instance = this;
    //半角全角スペースで区切る
    const wordArr = state.word.split(/[ |　]/)

    //フィルター
    response.forEach(function (list) {
      list.Title != null
        && list.Title != "ホーム"
        //フリーワード 内容とタイトル
        && (wordArr.filter(val => list.Title.indexOf(val) >= 0).length > 0 || (list.Description && wordArr.filter(val => list.Description.indexOf(val) >= 0).length > 0))
        && instance._setLikeCount(list)
        && instance._setCommentCount(list)
        && tmp.push(list)
    })
    status == "likeCountSort" && tmp.sort((a, b) => this._sortDescending(a.LikeCount, b.LikeCount));
    status == "commentCountSort" && tmp.sort((a, b) => this._sortDescending(a.CommentCount, b.CommentCount));
    status == "clickSearchButton" && tmp.sort((a, b) => this._sortDescending(a.Created, b.Created))
    this._pages = tmp;
    this.render();
  }
  private pushArr(tmp: IPageListItem[], list: IPageListItem) {
    console.log("push")
    tmp.push(list)
  }
  private async _getListItems(): Promise<IPageListItem[]> {
    console.log("getItems")
    const response = await this.context.spHttpClient.get(
      this.context.pageContext.web.absoluteUrl + `/_api/web/lists/getbytitle('サイトのページ')/items`,
      SPHttpClient.configurations.v1);

    if (!response.ok) {
      const responseText = await response.text();
      throw new Error(responseText);
    }

    const responseJson = await response.json();

    return responseJson.value as IPageListItem[];;
  }

  private async _setLikeCount(list: IPageListItem): Promise<void> {
    list.LikeCount = await this._getLikeCount(list.Id)
    console.log("likeCount")
  }

  private async _getLikeCount(id: string): Promise<number> {
    const response = await this.context.spHttpClient.get(
      this.context.pageContext.web.absoluteUrl + `/_api/web/lists/GetByTitle('サイトのページ')/items(${id})/likedBy?$inlineCount=AllPages`,
      SPHttpClient.configurations.v1);

    if (!response.ok) {
      const responseText = await response.text();
      throw new Error(responseText);
    }

    const responseJson = await response.json();
    return responseJson["@odata.count"]
  }

  private async _setCommentCount(list: IPageListItem): Promise<void> {
    list.CommentCount = await this._getCommentCount(list.Id)
    console.log("commentCount")
    //this.render()
  }

  private async _getCommentCount(id: string): Promise<number> {
    const response = await this.context.spHttpClient.get(
      this.context.pageContext.web.absoluteUrl + `/_api/web/lists/GetByTitle('サイトのページ')/items(${id})/Comments?$expand=replies,likedBy,replies/likedBy&$inlineCount=AllPages`,
      SPHttpClient.configurations.v1);

    if (!response.ok) {
      const responseText = await response.text();
      throw new Error(responseText);
    }

    const responseJson = await response.json();
    return responseJson["@odata.count"];
  }

  /**
   * 降順に並び替え
   * 
   * @param target1 
   * @param target2 
   * @returns 
   */
  private _sortDescending(target1: any, target2: any) {
    if (target1 == target2) { return 0 }
    if (target1 > target2) { return -1 }
    if (target1 < target2) { return 1 }
  }

  /**
   * 昇順に並び替え
   * 
   * @param target1 
   * @param target2 
   * @returns 
   */
  private _sortAscending(target1: any, target2: any) {
    console.log("sort")
    if (target1 == target2) { return 0 }
    if (target1 > target2) { return 1 }
    if (target1 < target2) { return -1 }
  }

  protected onInit(): Promise<void> {
    this._environmentMessage = this._getEnvironmentMessage();

    return super.onInit();
  }

  private _getEnvironmentMessage(): string {
    if (!!this.context.sdks.microsoftTeams) { // running in Teams
      return this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentTeams : strings.AppTeamsTabEnvironment;
    }

    return this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentSharePoint : strings.AppSharePointEnvironment;
  }

  protected onThemeChanged(currentTheme: IReadonlyTheme | undefined): void {
    if (!currentTheme) {
      return;
    }

    this._isDarkTheme = !!currentTheme.isInverted;
    const {
      semanticColors
    } = currentTheme;

    if (semanticColors) {
      this.domElement.style.setProperty('--bodyText', semanticColors.bodyText || null);
      this.domElement.style.setProperty('--link', semanticColors.link || null);
      this.domElement.style.setProperty('--linkHovered', semanticColors.linkHovered || null);
    }

  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('description', {
                  label: strings.DescriptionFieldLabel
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
