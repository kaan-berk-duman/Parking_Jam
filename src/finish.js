
export function displaySuccessView() {
    let existingView = document.getElementById("successView");
    if (existingView) {
      existingView.remove();
    }
    
    // Yeni bir görünüm oluşturuyoruz
    const view = document.createElement("div");
    view.id = "successView";
    view.style.position = "absolute";
    view.style.top = "50%";
    view.style.left = "50%";
    view.style.transform = "translate(-50%, -50%)";
    view.style.padding = "20px 40px";
    view.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
    view.style.color = "white";
    view.style.fontSize = "2rem";
    view.style.borderRadius = "8px";
    view.style.textAlign = "center";
    view.innerText = "Level 1 completed!";
  
    const closeButton = document.createElement("button");
    closeButton.innerText = "Next Level";
    closeButton.style.marginTop = "10px";
    closeButton.style.padding = "10px 20px";
    closeButton.style.fontSize = "1rem";
    closeButton.addEventListener("click", () => {
      view.remove();
    });
    view.appendChild(document.createElement("br"));
    view.appendChild(closeButton);
  
    document.body.appendChild(view);
  }
  