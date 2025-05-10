

    document.addEventListener("keydown", function(event) {
      if (event.ctrlKey && event.key === "r") { // Ctrl + R
        event.preventDefault();
        console.log("Ctrl + R is disabled");
      }
      if (event.key === "F5") { // F5
        event.preventDefault();
        console.log("F5 is disabled");}
    });
    