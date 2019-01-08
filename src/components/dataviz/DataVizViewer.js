import React, { Component } from 'react';
import { Container, Col, Row, ButtonGroup, Button } from 'reactstrap';
import GeneDataTable from "./GeneDataTable";
import SiteVennDiagram from './SiteVennDiagram';
import Instruction from './Instruction';
import each from 'lodash/each';

import atlas from '../../data/atlas';

class DataVizViewer extends Component {

    constructor(props) {
        super(props);
        this.getDataTableDefaultSortOrder = this.getDataTableDefaultSortOrder.bind(this);
        this.onVennClick = this.onVennClick.bind(this);
        this.onSiteClick = this.onSiteClick.bind(this);

        this.state = {
            vennFilter: [],
            tableRows: Object.values(atlas.result.cells[this.props.selectedCell].rows),
            vennSets: atlas.result.cells[this.props.selectedCell].sets,
            defaultSortOrder: this.getDataTableDefaultSortOrder()
        };
    }

    componentDidMount() {
        let cellFromUrl = decodeURIComponent(this.props.match.params.cellName);

        //If we detect the URL has a different selected cell state than redux, set redux to match URL
        if(this.props.selectedCell !== cellFromUrl) {
            this.props.setSelectedCell(cellFromUrl);
        }
    }

    getDataTableDefaultSortOrder() {
        let vennSets = atlas.result.cells[this.props.selectedCell].sets;
        let sites = { };
        let sitesArray = [ ];

        each(vennSets, function(vennSet) {
            each(vennSet.sets, function(site) {
                sites.hasOwnProperty(site) ?
                    sites[site] += parseInt(vennSet.size) :
                    sites[site] = parseInt(vennSet.size);
            });
        });

        for(let siteName in sites) {
            sitesArray.push({
                id: 'f_' + siteName + '_p_val_adj',
                size: sites[siteName],
                desc: true
            });
        }

        sitesArray.sort(function(a, b) {
            return a.size - b.size;
        });

        return sitesArray;
    }

    onVennClick(vennSet) {
        let siteNames = vennSet.sets.join(' ');

        this.setState({
            vennFilter: this.props.allSites.map(function (siteName) {
                return {
                    id: 'f_' + siteName + '_avgLogFc',
                    value: siteNames.indexOf(siteName) === -1 ? '-' : '+'
                };
            })
        });
    }

    onSiteClick(siteName) {
        let sites = this.props.selectedSites
            , siteIsSelected = sites.indexOf(siteName);

        if(siteIsSelected > -1 && sites.length > 1) {
            sites.splice(siteIsSelected, 1);
        }

        else {
            sites.push(siteName);
        }

        this.props.setSelectedSites(sites);
    }

    render() {
        return (
            <Container id="data-viewer">
                <Row className="page-header">
                    <Col className="mr-auto my-auto">
                        <h5>{this.props.selectedCell} gene expression</h5>
                    </Col>
                    <Col className="col-auto">
                        <ButtonGroup>
                            <Button color="primary" active>Transcriptomics</Button>
                            <Button color="primary" disabled outline>Proteomics</Button>
                            <Button color="primary" disabled outline>Metabolomics</Button>
                            <Button color="primary" disabled outline>Integrated</Button>
                        </ButtonGroup>
                    </Col>
                </Row>
                <Row className="page-instructions">
                    <p><em>Left</em>: The Venn diagram shows how many genes were found to be expressed by this cell type ({this.props.selectedCell}) at each Tissue Interrogation Site (TIS).</p>
                    <br/><p><em>Right</em>: The data table shows every expressed gene as measured by each TIS.  When a gene was not measured or found significant by a TIS, its values will show as "-" in the table.</p>
                </Row>
                <Row className="page-charts">
                    <Col sm={4} id="venn-diagram">
                        <Row className="column-header venn-header align-middle">
                            <Instruction
                                id="venn-diagram-instruction"
                                title="Reading the Venn Diagram"
                                placement="bottom">
                                <ul>
                                    <li>This shows the total number of expressed genes measured by each TIS.</li>
                                    <li>Changes to the Data Table do not affect this Venn diagram and vise versa.</li>
                                    <li>To show or hide a TIS’s values, click its name in the legend below.  At least 1 site must be selected.</li>
                                </ul>
                            </Instruction>
                            &nbsp;
                            <h6>Differentially expressed genes</h6>
                        </Row>
                        <Row>
                        <SiteVennDiagram
                            sets={this.state.vennSets}
                            sites={this.props.selectedSites}
                            allSites={this.props.allSites}
                            fixedSizeVenn={this.props.fixedSizeVenn}
                            onVennClick={this.onVennClick}
                        />
                        </Row>
                        <Row className="site-selector-group no-gutters">
                            { this.props.allSites.map((siteName) => {
                                return (
                                    <Row className="no-gutters w-100">
                                    <Button
                                        className={`site-selector-label ${siteName}`}
                                        active={this.props.selectedSites.indexOf(siteName) > -1}
                                        outline
                                        onClick={() => {this.onSiteClick(siteName)}} >
                                        {this.props.allSitePrettyNames[siteName]}
                                        </Button>
                                    </Row>);
                            })}
                        </Row>
                        <Row className="bottom-spacer" />
                    </Col>
                    <GeneDataTable
                        selectedCellName={this.props.selectedCell}
                        rows={this.state.tableRows}
                        allSites={this.props.allSites}
                        allSitesPrettyNames={this.props.allSitePrettyNames}
                        defaultSortOrder={this.state.defaultSortOrder}
                        vennFilter={this.state.vennFilter}
                    />
                </Row>
            </Container>
        );
    }
}

export default DataVizViewer;