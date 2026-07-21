document.addEventListener("DOMContentLoaded", () => {
    const searchForm = document.getElementById("search-form");
    const tokenInput = document.getElementById("token-address");
    const loader = document.getElementById("loader");
    const dashboard = document.getElementById("dashboard");
    const statusBadge = document.getElementById("api-status");
    
    let network = null;

    // Check backend status
    async function checkBackendStatus() {
        try {
            const res = await fetch("/api/status");
            if (res.ok) {
                const data = await res.json();
                const modeText = data.helius_connected ? "Live Analysis Mode" : "Hybrid Simulation Mode";
                statusBadge.innerHTML = `<span class="dot-blink" style="background-color: #10b981;"></span> Online (${modeText})`;
            }
        } catch (e) {
            statusBadge.innerHTML = `<span class="dot-blink" style="background-color: #ef4444;"></span> Offline (Backend not running)`;
        }
    }
    
    checkBackendStatus();

    // Bind example buttons
    document.querySelectorAll(".btn-example").forEach(btn => {
        btn.addEventListener("click", () => {
            tokenInput.value = btn.dataset.address;
            searchForm.dispatchEvent(new Event("submit"));
        });
    });

    // Form submit logic
    searchForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const address = tokenInput.value.trim();
        if (!address) return;

        // Reset UI states
        loader.style.display = "block";
        dashboard.style.display = "none";
        
        try {
            const res = await fetch(`/api/analyze/${address}`);
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.detail || "Failed to analyze token.");
            }
            
            const data = await res.json();
            renderDashboard(data);
        } catch (error) {
            alert(error.message || "Could not analyze token. Make sure backend is running on port 8000.");
            loader.style.display = "none";
        }
    });

    function renderDashboard(data) {
        loader.style.display = "none";
        dashboard.style.display = "grid";

        // 1. Render Market Data
        document.getElementById("token-name").textContent = data.name;
        document.getElementById("token-symbol").textContent = data.symbol;
        document.getElementById("token-symbol-avatar").textContent = data.symbol.substring(0, 2).toUpperCase();
        
        document.getElementById("price-usd").textContent = `$${data.price_usd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}`;
        document.getElementById("liquidity-usd").textContent = `$${data.liquidity_usd.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
        document.getElementById("volume-usd").textContent = `$${data.volume_24h.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
        
        const dexLink = document.getElementById("dex-link");
        if (data.token_address) {
            dexLink.href = `https://dexscreener.com/solana/${data.token_address}`;
            dexLink.style.display = "inline-block";
        } else {
            dexLink.style.display = "none";
        }

        // 2. Render Risk Meter
        const score = data.risk_score;
        const scoreEl = document.getElementById("risk-score");
        const riskLabel = document.getElementById("risk-label");
        const badge = document.getElementById("risk-level-badge");
        const circleWrap = document.querySelector(".risk-circle-wrap");
        const explanation = document.getElementById("risk-explanation");

        // Determine color based on score
        let riskColor = "var(--color-safe)";
        let riskGlow  = "rgba(16, 185, 129, 0.45)";
        let riskText  = "";
        if (score >= 75) {
            riskColor = "var(--color-danger)";
            riskGlow  = "rgba(239, 68, 68, 0.5)";
            riskText  = "CRITICAL INSIDER DANGER. Multiple wallet clusters share a common funding origin at Block 0. Extremely high probability of a coordinated developer dump.";
        } else if (score >= 50) {
            riskColor = "var(--color-warning)";
            riskGlow  = "rgba(245, 158, 11, 0.45)";
            riskText  = "HIGH INSIDER ACTIVITY. Several early wallets are linked through shared CEX funding or bought within the first 3 blocks of launch.";
        } else if (score >= 25) {
            riskColor = "#eab308";
            riskGlow  = "rgba(234, 179, 8, 0.4)";
            riskText  = "MEDIUM SUSPICION. Moderate cluster overlaps detected. Some early buyers are connected, but supply distribution is relatively spread.";
        } else {
            riskText = "SAFE OR LOW RISK. Clear wallet distributions. Funding sources appear organic, and early buying activity shows no insider coordination.";
        }

        // Animated count-up for the score number
        let current = 0;
        const duration = 1200; // ms
        const startTime = performance.now();
        const countUp = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
            current = Math.round(eased * score);
            scoreEl.textContent = current;
            if (progress < 1) requestAnimationFrame(countUp);
        };
        requestAnimationFrame(countUp);

        // Animate the conic gradient arc
        circleWrap.style.setProperty("--percentage", "0");
        circleWrap.style.background = `conic-gradient(${riskColor} calc(var(--percentage, 0) * 1%), rgba(255,255,255,0.04) 0)`;
        circleWrap.style.filter = `drop-shadow(0 0 18px ${riskGlow})`;
        setTimeout(() => {
            circleWrap.style.transition = "background 1.2s ease";
            circleWrap.style.setProperty("--percentage", score);
        }, 60);

        // Labels
        riskLabel.textContent = data.risk_level;
        badge.textContent = data.risk_level;
        badge.style.background = riskColor;
        badge.style.boxShadow = `0 4px 15px ${riskGlow}`;
        explanation.textContent = riskText;

        // 3. Render Wallets Table
        const tableBody = document.getElementById("wallets-table-body");
        tableBody.innerHTML = "";

        data.wallets.forEach(w => {
            const shortAddr = w.address.substring(0, 6) + "..." + w.address.substring(w.address.length - 4);
            const shortFunder = w.funding_source.substring(0, 6) + "..." + w.funding_source.substring(w.funding_source.length - 4);
            
            const txCount = w.wallet_tx_count ?? "N/A";
            const ageBadge = w.is_fresh_wallet 
                ? `<span class="tag-badge" style="background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.2); color: var(--color-danger); font-size:0.75rem;"><i class="fas fa-baby"></i> FRESH (${txCount} txs)</span>`
                : `<span class="tag-badge" style="background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.2); color: var(--color-safe); font-size:0.75rem;"><i class="fas fa-clock"></i> ACTIVE (${txCount} txs)</span>`;

            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td><a href="https://solscan.io/account/${w.address}" target="_blank" class="addr-link">${shortAddr} <i class="fas fa-external-link-alt" style="font-size:0.75rem;"></i></a></td>
                <td><span class="tag-badge ${w.type.toLowerCase()}">${w.type}</span></td>
                <td>${ageBadge}</td>
                <td style="font-weight:700;">${w.percentage_held.toFixed(2)}%</td>
                <td class="font-mono">${w.sol_spent.toFixed(2)} SOL</td>
                <td>Block ${w.block_purchased}</td>
                <td><a href="https://solscan.io/account/${w.funding_source}" target="_blank" class="addr-link">${w.funding_source.includes("Hot Wallet") || w.funding_source.includes("Source") || w.funding_source.includes("Hub") || w.funding_source.includes("Authority") ? w.funding_source : shortFunder}</a></td>
                <td class="font-mono">${w.funding_amount.toFixed(2)} SOL</td>
            `;
            tableBody.appendChild(tr);
        });

        // 4. Render Network Graph
        renderNetworkGraph(data.graph);
    }

    function renderNetworkGraph(graphData) {
        const container = document.getElementById("network-container");
        container.innerHTML = ""; // Clear loader / text

        const nodes = new vis.DataSet(graphData.nodes.map(n => {
            // Apply custom styles based on node type
            let color = "#3b82f6"; // default blue
            if (n.group === "insider") color = "#ef4444"; // red
            if (n.group === "holder") color = "#10b981"; // green
            if (n.group === "funder") color = "#8b5cf6"; // purple
            
            return {
                ...n,
                color: {
                    background: color,
                    border: "#fff",
                    highlight: {
                        background: color,
                        border: "#fff"
                    }
                },
                font: {
                    color: "#fff",
                    face: "Outfit",
                    size: 12
                },
                borderWidth: 2,
                shape: "dot"
            };
        }));

        const edges = new vis.DataSet(graphData.edges.map(e => {
            return {
                ...e,
                font: {
                    align: "middle",
                    color: "rgba(255, 255, 255, 0.4)",
                    size: 9,
                    face: "JetBrains Mono"
                },
                arrows: {
                    to: {
                        enabled: true,
                        scaleFactor: 0.5
                    }
                },
                width: 1
            };
        }));

        const data = { nodes, edges };
        
        const options = {
            physics: {
                barnesHut: {
                    gravitationalConstant: -3000,
                    centralGravity: 0.3,
                    springLength: 95,
                    springConstant: 0.04,
                    damping: 0.09
                },
                stabilization: {
                    enabled: true,
                    iterations: 150
                }
            },
            interaction: {
                hover: true,
                zoomView: true,
                dragView: true
            }
        };

        network = new vis.Network(container, data, options);
    }
});
