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
import { ICategory, IPageListItem } from '../../models';

export interface ISearchFormWebPartProps {
  description: string;
}

export default class SearchFormWebPart extends BaseClientSideWebPart<ISearchFormWebPartProps> {

  private _isDarkTheme: boolean = false;
  private _environmentMessage: string = '';
  private _pages: IPageListItem[] = [];
  private _categoryList: ICategory[] = [];

  public render(): void {
    const element: React.ReactElement<ISearchFormProps> = React.createElement(
      SearchForm,
      {
        pageListItem: this._pages,
        categoryList:this._categoryList,
        onGetListItems: this._onGetListItems,
        search:this._search,
        onGetCategory:this._onGetCategory,
        isDarkTheme: this._isDarkTheme,
        environmentMessage: this._environmentMessage,
        hasTeamsContext: !!this.context.sdks.microsoftTeams,
        userDisplayName: this.context.pageContext.user.displayName
      }
    );

    ReactDom.render(element, this.domElement);
  }

  private _onGetCategory= async ():Promise<void> => {
    const response: ICategory[] = await this._getCategory();
    this._categoryList = response;
    this.render();
  }

  private async _getCategory(): Promise<ICategory[]>{
    const response = await this.context.spHttpClient.get(
      this.context.pageContext.web.absoluteUrl + `/_api/web/lists/getbytitle('category')/items`,
      SPHttpClient.configurations.v1
    );

    if(!response.ok){
      const responseText = await response.text();
      throw new Error(responseText);
    }

    const responseJson = await response.json();

    return responseJson.value as ICategory[];
  }

  private _onGetListItems = async ():Promise<void> => {
    const response: IPageListItem[] = await this._getListItems();
    const tmp:IPageListItem[] = [];
    response.forEach(async function(list){
      list.Title != null
      && list.Title != "ホーム"
      && list.Title != "template1"
      && list.Title != "template2"
      && list.Title != "template3"
      &&　tmp.push(list);
    })
    this._pages = tmp;
    this.render();
  }

  private async _getListItems(): Promise<IPageListItem[]>{
    const response = await this.context.spHttpClient.get(
      this.context.pageContext.web.absoluteUrl + `/_api/web/lists/getbytitle('サイトのページ')/items`,
      SPHttpClient.configurations.v1);

    if(!response.ok){
      const responseText = await response.text();
      throw new Error(responseText);
    }

    const responseJson = await response.json();

    return responseJson.value as IPageListItem[];
  }
  
  private _search = async (word:string):Promise<void> => {
    const response: IPageListItem[] = await this._getSearchTitle();
    const tmp:IPageListItem[] = [];
    response.forEach(async function(list){
      list.Title != null
      && list.Title.indexOf(word)>=0
      &&　tmp.push(list);
    })
    this._pages = tmp;
    this.render();
  }

  private async _getSearchTitle(): Promise<IPageListItem[]>{
    const response = await this.context.spHttpClient.get(
      this.context.pageContext.web.absoluteUrl + `/_api/web/lists/getbytitle('サイトのページ')/items?$select=Id,Title`,
      SPHttpClient.configurations.v1);
    
    if(!response.ok){
      const responseText = await response.text();
      throw new Error(responseText);
    }

    const responseJson = await response.json();

    return responseJson.value as IPageListItem[];
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
