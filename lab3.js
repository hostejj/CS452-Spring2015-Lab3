var canvas;
var gl;

var numVertices  = 24;

var pointsArray = [];
var normalsArray = [];

//from -10 to +10
var vertices = [
		vec4(  0,  7,  2, 1.0 ),
		vec4( -7, -7,  2, 1.0 ),
		vec4(  7, -7,  2, 1.0 ),
		vec4(  0,  7, -2, 1.0 ),
		vec4( -7, -7, -2, 1.0 ),
		vec4(  7, -7, -2, 1.0 )
    ];

var lightPosition = vec4(1.0, 1.0, 1.0, 0.0 );
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 0.0, 1.0 );

var materialAmbient = vec4( 1.0, 0.0, 0.0, 1.0 );
var materialDiffuse = vec4( 1.0, 0.0, 1.0, 1.0);
var materialSpecular = vec4( 1.0, 0.8, 0.0, 1.0 );
var materialShininess = 100.0;

var ctm;
var ambientColor, diffuseColor, specularColor;
var mvMatrix, projection;
var viewerPos;
var program;

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;
var axis = 0;
var theta =[0, 0, 0];
var delta = 1.5;

var thetaLoc;

var pos = true;
var flag = true;

function quad(a, b, c, d) {

     var t1 = subtract(vertices[d], vertices[b]);
     var t2 = subtract(vertices[d], vertices[c]);
     var normal = cross(t2, t1);
     var normal = vec3(normal);


     pointsArray.push(vertices[a]); 
     normalsArray.push(normal); 
     pointsArray.push(vertices[b]); 
     normalsArray.push(normal); 
     pointsArray.push(vertices[c]); 
     normalsArray.push(normal);   
     pointsArray.push(vertices[a]);  
     normalsArray.push(normal); 
     pointsArray.push(vertices[c]); 
     normalsArray.push(normal); 
     pointsArray.push(vertices[d]); 
     normalsArray.push(normal);    
}

function tri(a,b,c){
    var t1 = subtract(vertices[b], vertices[a]);
    var t2 = subtract(vertices[c], vertices[a]);
    var normal = cross(t1, t2);
    var normal = vec3(normal);

	var indices = [a,b,c];
	
	for ( var i = 0; i < indices.length; ++i ) {
        pointsArray.push( vertices[indices[i]] );
		normalsArray.push(normal);
    } 
}

function colorPrism()
{
    quad( 0, 1, 4, 3 );
    quad( 2, 0, 3, 5 );
    quad( 1, 2, 5, 4 );
	tri( 0, 1, 2);
	tri( 5, 4, 3);
}


window.onload = function init() {
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.1, 0.3, 0.1, 1.0 ); 
    
    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    colorPrism();

    var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW );
    
    var vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW );
    
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    thetaLoc = gl.getUniformLocation(program, "theta"); 
    
    viewerPos = vec3(0.0, 0.0, -20.0 );

    projection = ortho(-1, 1, -1, 1, -100, 100);
    
    ambientProduct = mult(lightAmbient, materialAmbient);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    specularProduct = mult(lightSpecular, materialSpecular);

    gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"),
       flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"),
       flatten(diffuseProduct) );
    gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"), 
       flatten(specularProduct) );	
    gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"), 
       flatten(lightPosition) );
       
    gl.uniform1f(gl.getUniformLocation(program, 
       "shininess"),materialShininess);
    
    gl.uniformMatrix4fv( gl.getUniformLocation(program, "pMatrix"),
       false, flatten(projection));
    
    render();
	
		//event listeners for keyboard 
	window.onkeydown = function(event) {
		var key = String.fromCharCode(event.keyCode);
		switch (key) {			
			case "&":
				axis = xAxis;
				pos = true;
				break;
			case "%":
				//move left
				axis = yAxis;
				pos = false;
				break;
			case "(":
				axis = xAxis;
				pos = false;
				break;
			case "'":
				//move right
				axis = yAxis;
				pos = true;
				break;
			case "P":
				// pause
				if(flag){
					flag = false;
				} else {
					flag = true;
				}
				break;
		}
	};
}

var render = function(){
            
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      
	if(flag){
		if(pos){		
			theta[axis] += delta;
		} else {
			theta[axis] -= delta;
		}
	}
            
	mvMatrix = mat4(vec4(0.1,0,0,0),
					vec4(0,0.1,0,0),
					vec4(0,0,0.1,0),
					vec4(0,0,0,1));
    mvMatrix = mult(mvMatrix, rotate(theta[xAxis], [1, 0, 0] ));
    mvMatrix = mult(mvMatrix, rotate(theta[yAxis], [0, 1, 0] ));
    mvMatrix = mult(mvMatrix, rotate(theta[zAxis], [0, 0, 1] ));
    
    gl.uniformMatrix4fv( gl.getUniformLocation(program,
            "mvMatrix"), false, flatten(mvMatrix) );

    gl.drawArrays( gl.TRIANGLES, 0, numVertices );
            
            
    requestAnimFrame(render);
}