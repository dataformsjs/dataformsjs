
export function PageSearch({match}) {
    return (
        <JsonData
            url="https://www.dataformsjs.com/data/geonames/countries?order_by=country"
            lang={match.params.lang}
            isLoading={<ShowLoading />}
            hasError={<ShowError />}
            isLoaded={<ShowSearchPage />}
            loadOnlyOnce={true} />
    );
}

class ShowSearchPage extends React.Component {
    constructor(props) {
        super(props);
        this.submitSearch = this.submitSearch.bind(this);
        this.handleCityChange = this.handleCityChange.bind(this);
        this.handleCountryChange = this.handleCountryChange.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.state = {
            country: '',
            city: '',
            submittedSeach: false,
            waitToSearch: false,
        };
    }

    /**
     * Button click event or when user presses {enter} key on city name
     */
    submitSearch() {
        this.setState({
            submittedSeach: true,
            waitToSearch: false,
        });
    }

    handleKeyDown(e) {
        if (e.keyCode !== 13) {
            return;
        }
        e.preventDefault();
        this.submitSearch();
    }

    handleCountryChange(event) {
        this.setState({
            country: event.target.value,
            waitToSearch: true,
        });
    }

    handleCityChange(event) {
        this.setState({
            city: event.target.value,
            waitToSearch: true,
        });
    }

    render() {
        return (
            <React.Fragment>
                <h1>{i18n.text('Search')}</h1>
    
                <nav>
                    <Link to={'/' + this.props.params.lang + '/'}>{i18n.text('Countries')}</Link>
                </nav>
    
                <form>
                    <select value={this.state.country} onChange={this.handleCountryChange}>
                        <option value="">{i18n.text('-- Select a Country (Optional) --')}</option>
                        {this.props.data.countries.map(country => {
                            return (
                                <option key={country.iso} value={country.iso}>{country.country}</option>
                            )
                        })}
                    </select>
    
                    <input
                        value={this.state.city}
                        onChange={this.handleCityChange}
                        onKeyDown={this.handleKeyDown}
                        placeholder={i18n.text("Search for a City, example 'Paris' or 'London'")} />
    
                    <button type="button" onClick={this.submitSearch}>{i18n.text('Search')}</button>
                </form>

                {/* State changes from Form events are passed to <SearchResults> as props */}
                <SearchResults
                    country={this.state.country}
                    city={this.state.city}
                    lang={this.props.params.lang}
                    submittedSeach={this.state.submittedSeach}
                    waitToSearch={this.state.waitToSearch} />

            </React.Fragment>
        )
    }
}

function SearchResults(props) {
    // Hide the search screen if it has not yet been searched or if there is an existing
    // search and the user changes the search criteria (props.waitToSearch). This behavior
    // is different than the Handlebars and Vue demos to avoid <JsonData> from searching
    // on every keystroke.
    if (!props.submittedSeach || props.waitToSearch) {
        return null;
    }
    return (
        <JsonData
            url="https://www.dataformsjs.com/data/geonames/search?country=:country&city=:city"
            country={props.country}
            city={props.city}
            lang={props.lang}
            isLoading={<ShowLoading />}
            hasError={<ShowError />}
            isLoaded={<ShowSearchResults />} />
    )
}

function ShowSearchResults(props) {
    return (
        <React.Fragment>
            <InputFilter
                filter-selector="table"
                filter-results-selector="h1"
                filter-results-text-all={i18n.text('{totalCount} Cities Found')}
                filter-results-text-filtered={i18n.text('Showing {displayCount} of {totalCount} Cities')}
                placeholder={i18n.text("Enter filter")} />

            <SortableTable
                data-sort-class-odd="row-odd"
                data-sort-class-even="row-even">
                <thead>
                    <tr>
                        <th>{i18n.text('Country')}</th>
                        <th>{i18n.text('Name')}</th>
                        <th>{i18n.text('Population')}</th>
                        <th>{i18n.text('Elevation')}</th>
                        <th>{i18n.text('Timezone')}</th>
                        <th>{i18n.text('Date Last Modified')}</th>
                    </tr>
                </thead>
                <tbody>
                    {props.data.cities.map(city => {
                        return (
                            <tr key={city.geonames_id}>
                                <td>
                                    <i class={city.country_code.toLowerCase() + ' flag'}></i>
                                    {city.country_code}
                                </td>
                                <td><Link to={'/' + props.params.lang + '/city/' + city.geonames_id}>{city.name}</Link></td>
                                <td className="align-right" data-value={city.population}>{format.number(city.population)}</td>
                                <td className="align-right" data-value={city.elevation}>{format.number(city.elevation)}</td>
                                <td>{city.timezone}</td>
                                <td className="align-right">{format.date(city.modification_date)}</td>
                            </tr>
                        )
                    })}
                </tbody>
            </SortableTable>
        </React.Fragment>
    )
}
