// Fetch Variables
let url = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json';
let req = new XMLHttpRequest();

// Bar Scales Variables
let xScale, yScale;

// SVG Dimensions Variables
let width = 800, height = 500, padding = 40;

// Store the SVG Element
let svg = d3.select('svg');

// Function to add the width and height to the svg
function drawSvg() {
    svg.attr('width', width)
        .attr('height', height);
}

// Function to generate the scales
function generateScales(response) {
    xScale = d3.scaleLinear()
        .domain([
            d3.min(response, (d) => {
                return d['Year']
            }) - 1,
            d3.max(response, (d) => {
                return d['Year']
            }) + 1
        ])
        .range([padding, width - padding]);

    yScale = d3.scaleTime()
        .domain([
            d3.min(response, (d) => {
                return new Date(d['Seconds'] * 1000)
            }),
            d3.max(response, (d) => {
                return new Date(d['Seconds'] * 1000)
            })
        ])
        .range([padding, height - padding]);
}

// Function to generate the axes
function generateAxes() {
    // Move the x-axis
    let xAxis = d3.axisBottom(xScale).tickFormat(d3.format('d'));
    svg.append('g')
        .call(xAxis)
        .attr('id', 'x-axis')
        .attr('transform', `translate(0, ${height - padding})`);

    // Move the y-axis
    let yAxis = d3.axisLeft(yScale).tickFormat(d3.timeFormat('%M:%S'));
    svg.append('g')
        .call(yAxis)
        .attr('id', 'y-axis')
        .attr('transform', `translate(${padding}, 0)`);
}

// Function to create the points
function drawPoins(response) {
    //Creating the Tooltip
    let ToolTip = d3
        .select("main")
        .append("div")
        .attr("id", "tooltip")
        .style("position", "absolute")
        .style("background-color", "rgba(0,0,0,0.8)")
        .style("padding", "10px")
        .style("color", "#ffffff")
        .style("border-radius", "15px")
        .style("opacity", 0);

    //Creating the Dots
    svg.selectAll('circle')
        .data(response)
        .enter()
        .append('circle')
        .attr('class', 'dot')
        .attr('r', 5)
        .attr('data-xvalue', (d) => { return d['Year'] })
        .attr('data-yvalue', (d) => { return new Date(d['Seconds'] * 1000) })
        .attr('cx', (d) => {
            return xScale(d['Year'])
        })
        .attr('cy', (d) => {
            return yScale(new Date(d['Seconds'] * 1000))
        })
        .attr('fill', (d) => {
            return d['Doping'] != '' ? '#34b46d' : '#d83535'
        })
        .on("mouseover", function (event, d) {
            ToolTip.style("opacity", 0.9);
            ToolTip.attr("data-year", d.Year);
            ToolTip.html(
                d.Name +
                ": " +
                d.Nationality +
                "<br/>" +
                "Year: " +
                d.Year +
                ", Time: " +
                d3.timeFormat(d.Time) +
                (d.Doping ? "<br/><br/>" + d.Doping : "")
            )
                .style("left", event.pageX + 10 + "px")
                .style("top", event.pageY + 10 + "px");
            console.log("movement");
        })
        .on("mouseout", function () {
            ToolTip.style("opacity", 0);
        });

    //Creating the Legend
    const legendContainer = svg.append("g").attr("id", "legend");

    const legend = legendContainer
        .selectAll("#legend")
        .data(response)
        .enter()
        .append("g")
        .attr("class", "legend-label")
        .attr("transform", function (d, i) {
            return "translate(0," + (height / 2 - i * 20) + ")";
        });

    legend
        .append("circle")
        .attr("cx", width - 10)
        .attr("cy", height * 0.02)
        .attr("r", 10)
        .style("fill", "transparent");

    legend
        .append("text")
        .attr("x", width - 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .style("fill", "transparent")
        .text(function (d) {
            return d ? "Riders with doping allegations" : "No doping allegations"
        });
}

/**
 * We make the request to the url and we tell it that we are making a 'GET' request 
 * and that the function is asynchronous.
 */

req.open('GET', url, true);
req.onload = () => {
    // Response Variables
    let response = JSON.parse(req.responseText);

    // We call the functions and pass the data to those who need it
    drawSvg();
    generateScales(response);
    drawPoins(response);
    generateAxes();
}
req.send();