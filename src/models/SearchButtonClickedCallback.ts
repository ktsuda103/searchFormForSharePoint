import { ISearchFormState } from "../models/ISearchFormState"

export type SearchButtonClickedCallback = (state: ISearchFormState, status?: string) => void;