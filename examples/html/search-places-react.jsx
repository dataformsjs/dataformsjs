'use strict';

// This demo can use either [jQuery] and [chosen] or [React Select] depending on the value of `useChosen`.
const useChosen = false;

// jQuery / chosen:
//    https://harvesthq.github.io/chosen/
//
// React Select:
//     https://react-select.com/home

export function PageSearch({match}) {
    // Define the scripts to download. Scripts will be downloaded only once
    // and only if this page is accessed.
    //
    // `loadScriptsInOrder = true` is used for [chosen] because [jquery.js]
    // must be included before [chosen.js] and [countries-chosen.css] must
    // be loaded after [chosen.css].
    //
    // By default <LazyLoad> will download all scripts at the same time.
    //
    let scripts;
    let loadScriptsInOrder;
    if (useChosen) {
        loadScriptsInOrder = true;
        scripts = [
            'https://code.jquery.com/jquery-3.4.1.min.js',
            'https://cdn.jsdelivr.net/npm/chosen-js@1.8.7/chosen.css',
            'https://cdn.jsdelivr.net/npm/chosen-js@1.8.7/chosen.jquery.min.js',
            'css/countries-chosen.css',
        ];
    } else {
        loadScriptsInOrder = false;
        scripts = [
            'https://cdn.jsdelivr.net/npm/emotion@9.2.12/dist/emotion.umd.min.js',
            'https://unpkg.com/prop-types@15.5.10/prop-types.min.js',
            'https://unpkg.com/react-input-autosize@2.2.1/dist/react-input-autosize.min.js',
            'https://unpkg.com/react-select@2.1.2/dist/react-select.min.js',
        ];
    }

    // First download scripts
    return (
        <LazyLoad
            isLoading={<ShowLoading />}
            loadScriptsInOrder={loadScriptsInOrder}
            scripts={scripts}>
            {/*
                Once the plugin/component is loaded then load the search page
            */}
            <JsonData
                url="https://www.dataformsjs.com/data/geonames/countries?order_by=country"
                lang={match.params.lang}
                isLoading={<ShowLoading />}
                hasError={<ShowError />}
                isLoaded={<ShowSearchPage />} />
        </LazyLoad>
    );
}

class ShowSearchPage extends React.Component {
    constructor(props) {
        super(props);
        this.submitSearch = this.submitSearch.bind(this);
        this.handleCityChange = this.handleCityChange.bind(this);
        this.handleCountryChange = this.handleCountryChange.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.state = Cache.get('search', {
            country: '',
            city: '',
            submittedSeach: false,
            waitToSearch: false,
        });

        // Define selected country object in format needed for [react-select]
        this.selectedCountry = null;
        if (this.state.country !== '') {
            const country = this.props.data.countries.find(c => c.iso === this.state.country);
            if (country) {
                this.selectedCountry = {value: country.iso, label:country.country };
            }
        }
    }

    componentDidUpdate() {
        Cache.set('search', this.state);
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
        // If using the <Select> control the select options { value, label }
        // will be passed instead of a DOM Event. [event.target] is used for native <select>
        // and the <Chosen> class. Additionally [event === null] comes from React Select.
        if (event === null) {
            this.setState({
                country: '',
                waitToSearch: true,
            });
            return;
        }
        this.setState({
            country: (event.target !== undefined ? event.target.value : event.value),
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
                    {/* The <Chosen> Component is defined at the bottom of this file */}
                    {useChosen
                        ? <Chosen
                            defaultValue={this.state.country}
                            onChange={this.handleCountryChange}
                            options={{ allow_single_deselect: true }}
                            placeholder={i18n.text('-- Select a Country (Optional) --')}>
                            <option value=""></option>
                            {this.props.data.countries.map(country => {
                                return (
                                    <option key={country.iso} value={country.iso} selected={country.iso === this.state.country}>{country.country}</option>
                                )
                            })}
                        </Chosen>

                        : <Select
                            defaultValue={this.selectedCountry}
                            onChange={this.handleCountryChange}
                            className="react-select"
                            placeholder={i18n.text('-- Select a Country (Optional) --')}
                            isClearable={true}
                            options={
                            this.props.data.countries.map(country => {
                                return {value: country.iso, label:country.country };
                            })} />
                    }


                    {/*
                        Commented version using a basic <select> element.
                    */}
                    {/*
                        <select value={this.state.country} onChange={this.handleCountryChange}>
                            <option value="">{i18n.text('-- Select a Country (Optional) --')}</option>
                            {this.props.data.countries.map(country => {
                                return (
                                    <option key={country.iso} value={country.iso}>{country.country}</option>
                                )
                            })}
                        </select>
                    */}

                    <input
                        defaultValue={this.state.city}
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
            isLoaded={<ShowSearchResults />}
            loadOnlyOnce={true} />
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
                    {props.data && props.data.cities && props.data.cities.map(city => {
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


// Copied and modified from: https://reactjs.org/docs/integrating-with-other-libraries.html
class Chosen extends React.Component {
    componentDidMount() {
        this.$el = $(this.el);
        this.$el.chosen(this.props.options);

        this.handleChange = this.handleChange.bind(this);
        this.$el.on('change', this.handleChange);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.children !== this.props.children) {
            this.$el.trigger("chosen:updated");
        }
    }

    componentWillUnmount() {
        this.$el.off('change', this.handleChange);
        this.$el.chosen('destroy');
    }

    handleChange(e) {
        this.props.onChange(e);
    }

    render() {
        return (
            <select className="chosen-select" ref={el => this.el = el} data-placeholder={this.props.placeholder}>
                {this.props.children}
            </select>
        );
    }
}
