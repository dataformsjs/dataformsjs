'use strict';

function ShowCity(props) {
    return (
        <React.Fragment>
            <h1>{props.data.place.name}</h1>

            <nav>
                <Link to={'/' + props.params.lang + '/'}>{i18n.text('Countries')}</Link>
                <Link to={'/' + props.params.lang + '/regions/' + props.data.place.country_code}>{i18n.text('Regions')}</Link>
                <Link to={'/' + props.params.lang + '/cities/' + props.data.place.country_code + '/' + props.data.place.admin1_code}>{i18n.text('Cities')}</Link>
            </nav>

            <div class="place-screen">

                <section class="form-fields">
                    <div>
                        <label class="no-top-margin">{i18n.text('Name')}</label>
                        <span>{props.data.place.name}</span>
                    </div>
                    <div v-if="place.name !== place.ascii_name">
                        <label>{i18n.text('ASCII Name')}</label>
                        <span>{props.data.place.ascii_name}</span>
                    </div>
                    <div>
                        <label>{i18n.text('Country (ISO)')}</label>
                        <span>{props.data.place.country_code}</span>
                        <i className={props.data.place.country_code.toLowerCase() + ' flag'}></i>
                    </div>
                    <div>
                        <label>{i18n.text('Region (State, Province, etc.)')}</label>
                        <span>{props.data.place.admin1_code}</span>
                    </div>
                    <div>
                        <label>{i18n.text('Population')}</label>
                        <span>{format.number(props.data.place.population)}</span>
                    </div>
                    <div>
                        <label>{i18n.text('Elevation')}</label>
                        <span>{format.number(props.data.place.elevation)} m / {format.number(parseInt(props.data.place.elevation * 3.28084, 10))} &#039;</span>
                    </div>
                    <div>
                        <label>{i18n.text('Latitude')}</label>
                        <span>{props.data.place.latitude}</span>
                    </div>
                    <div>
                        <label>{i18n.text('Longitude')}</label>
                        <span>{props.data.place.longitude}</span>
                    </div>
                    <div>
                        <label>{i18n.text('Timezone')}</label>
                        <span>{props.data.place.timezone}</span>
                    </div>
                    <div>
                        <label>{i18n.text('Date Last Modified')}</label>
                        <span>{format.date(props.data.place.modification_date)}</span>
                    </div>
                </section>

                <section>
                    <LeafletMap
                        latitude={props.data.place.latitude}
                        longitude={props.data.place.longitude}
                        zoom={11}
                        marker={props.data.place.name} />

                    <div class="map-links">
                        <small><a href={'https://www.openstreetmap.org#map=12/' + props.data.place.latitude + '/' + props.data.place.longitude} target="_blank">{i18n.text('View on OpenStreetMap')}</a></small>
                        <small><a href={'https://www.google.com/maps/@' + props.data.place.latitude + ',' + props.data.place.longitude + ',12z'} target="_blank">{i18n.text('View on Google Maps')}</a></small>
                    </div>
                </section>
            </div>

            <section class="alternate-names">
                <h2>{i18n.text('Alternate Names')} ({props.data.place.alternate_names.length})</h2>

                {props.data.place.alternate_names.length > 10 ?
                    <InputFilter
                        filter-selector=".alternate-names li"
                        filter-results-selector="h2"
                        filter-results-text-all={i18n.text('Alternate Names ({totalCount})')}
                        filter-results-text-filtered={i18n.text('Showing {displayCount} of {totalCount} Alternate Names')}
                        placeholder={i18n.text('Enter filter')} />
                    : null}

                <ul>
                    {props.data.place.alternate_names.map && props.data.place.alternate_names.map(name => {
                        return (
                            <li key={name}>{name}</li>
                        )
                    })}
                </ul>
            </section>
        </React.Fragment>
    )
}
